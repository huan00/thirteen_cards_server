import express from 'express'
import cors from 'cors'
import * as http from 'http'
import { Server } from 'socket.io'
import Deck from './controllers/Deck.js'
import { createId } from './utilities/index.js'
import { compareHands, checkQualify, checkAuto } from './controllers/sets.js'

const PORT = process.env.PORT || 3001
const app = express()
app.use(cors())
const server = http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:19006', 'exp://192.168.4.27:19000', '*'],
    // origin: ['*'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-requested-with'],
    credentials: true
  }
})

const roomState = {}

io.on('connection', async (client) => {
  client.on('disconnecting', (reason) => {
    const [, room] = client.rooms
    const playerName = roomState[room]
      ? roomState[room]['player'][client.id].name
      : ''
    io.to(room).emit('playerLeft', { playerName })
    io.to(room).emit('leaveRoom', { playerName })
  })

  const handleCreateRoom = (data) => {
    let roomId = createId()
    roomState[roomId] = {
      player: {
        [client.id]: {
          name: data.playerName,
          totalScore: 0,
          clientId: client.id,
          currentScore: 0,
          autoWin: false,
          startGame: false
        }
      },
      submitCount: {},
      playing: false
    }

    client.join(roomId)

    client.emit('createdRoom', {
      clientId: client.id,
      roomId: roomId,
      playerName: data.playerName
    })
  }

  const handleJoinRoom = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()

    let currentRoomPlayer = roomSockets.length

    if (currentRoomPlayer === 0) {
      client.emit('unknowRoom')
      return
    } else if (roomState[data.roomId]['playing']) {
      client.emit('gameOnPlay')
      return
    } else if (currentRoomPlayer > 3) {
      client.emit('tooManyPlayers')
      return
    }

    roomState[data.roomId]['player'][client.id] = {
      name: data.playerName,
      totalScore: 0,
      currentScore: 0,
      clientId: client.id,
      autoWin: false,
      startGame: false
    }

    client.join(data.roomId)

    client.emit('clientId', { clientId: client.id })
    client.emit('roomId', data.roomId)
    const room = await io.in(data.roomId).fetchSockets()
    const playersInRoom = room.length

    io.to(data.roomId).emit('playerJoin', {
      playerName: data.playerName,
      playersInRoom,
      roomState: roomState[data.roomId]['player']
    })
  }

  const handleDealHand = async (data) => {
    if (!roomState[data.roomId]) {
      client.emit('roomClosed')
      return
    }
    //get number of players in room
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    roomState[data.roomId]['submitCount'][client.id] = true

    //if room doesn't have 2 or more player return
    if (clientNumber < 2) return

    roomState[data.roomId]['player'][client.id].startGame = true
    //count how many player click start
    //return message to tell player to wait
    if (
      clientNumber !== Object.keys(roomState[data.roomId]['submitCount']).length
    ) {
      client.emit('waitingOnPlayer')
      io.to(data.roomId).emit('playerClickStart', {
        roomState: roomState[data.roomId]['player']
      })
      return
    }

    //emit ready to all player
    io.to(data.roomId).to(client.id).emit('ready')

    //create and shuffle deck
    const deck = new Deck()
    deck.shuffle()
    deck.shuffle()
    deck.shuffle()
    const hands = deck.deal_hand()

    const playerKeys = Object.keys(roomState[data.roomId]['player'])

    //set start game back to false
    playerKeys.forEach(
      (clientId) =>
        (roomState[data.roomId]['player'][clientId].startGame = false)
    )

    //loop player list and send hand to player
    playerKeys.forEach((clientId, index) => {
      io.emit(clientId, {
        hand: hands[index],
        roomState: roomState[data.roomId]
      })
    })
    //restart count
    roomState[data.roomId]['submitCount'] = {}
    roomState[data.roomId]['playing'] = true
  }

  const handleSubmitHand = async (data) => {
    if (!roomState[data.roomId]) {
      client.emit('roomClosed')
      return
    }
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    // const count = submitCount[data.roomId]

    roomState[data.roomId]['submitCount'][client.id] = true
    roomState[data.roomId]['player'][client.id]['hand'] = [...data.hand]
    roomState[data.roomId]['player'][client.id]['startGame'] = true

    //get player keys from the room
    const playerKeys = Object.keys(roomState[data.roomId]['player'])

    //check for auto win

    //If not all user submit hand. tell user to wait.
    if (
      Object.keys(roomState[data.roomId]['submitCount']).length !== clientNumber
    ) {
      client.emit('waiting')
      io.to(data.roomId).emit('playerSubmitHand', {
        roomState: roomState[data.roomId]['player']
      })
      return
    }

    //check if the hand submitted is qualify or not
    // subtract point from disqualify player
    //check for autoWin and add score to player
    const hands = []
    playerKeys.forEach((key) => {
      const hand = roomState[data.roomId]['player'][key].hand

      if (checkQualify(hand)) {
        //Check for auto win
        if (checkAuto(hand)) {
          const winnerKey = key
          const points = (playerKeys.length - 1) * 5

          roomState[data.roomId]['player'][winnerKey].currentScore += points
          roomState[data.roomId]['player'][winnerKey].totalScore += points
          roomState[data.roomId]['player'][winnerKey].autoWin = true

          playerKeys.forEach((playerKey) => {
            if (playerKey !== winnerKey) {
              roomState[data.roomId]['player'][playerKey].currentScore -= 5
              roomState[data.roomId]['player'][playerKey].totalScore -= 5
            }
          })
        } else {
          hands.push({
            hand: hand,
            playerName: key
          })
        }
      } else {
        const disqualify = key
        const points = (playerKeys.length - 1) * 3
        roomState[data.roomId]['player'][disqualify].currentScore -= points
        roomState[data.roomId]['player'][disqualify].totalScore -= points

        playerKeys.forEach((playerKey) => {
          if (playerKey !== disqualify) {
            roomState[data.roomId]['player'][playerKey].currentScore += 3
            roomState[data.roomId]['player'][playerKey].totalScore += 3
          }
        })
      }
    })

    //if more than 2 players qualify then compare hand
    if (hands && hands.length > 1) {
      const scores = compareHands(...hands)

      for (let i = 0; i < scores.length; i++) {
        for (
          let j = 0;
          j < Object.keys(roomState[data.roomId]['player']).length;
          j++
        ) {
          if (
            Object.keys(scores[i])[0] ===
            Object.keys(roomState[data.roomId]['player'])[j]
          ) {
            //current score
            roomState[data.roomId]['player'][
              Object.keys(roomState[data.roomId]['player'])[j]
            ]['currentScore'] += scores[i][Object.keys(scores[i])[0]].score

            //total score
            roomState[data.roomId]['player'][
              Object.keys(roomState[data.roomId]['player'])[j]
            ].totalScore += scores[i][Object.keys(scores[i])[0]].score
          }
        }
      }
    }

    io.to(data.roomId).emit('showHand', roomState[data.roomId])

    //reset currentScore for players
    playerKeys.forEach((key) => {
      roomState[data.roomId]['player'][key].currentScore = 0
      roomState[data.roomId]['player'][key].autoWin = false
      roomState[data.roomId]['player'][key].startGame = false
    })

    hands.splice(0, hands.length)
    roomState[data.roomId]['submitCount'] = {}
    roomState[data.roomId]['playing'] = false
  }

  const handleLeaveRoom = async (data) => {
    client.leave(data.roomId)
    const room = await io.in(data.roomId).fetchSockets()
    const playersInRoom = room.length
    io.to(data.roomId).emit('playerLeft', {
      playerName: data.playerName,
      playersInRoom,
      roomState: roomState[data.roomId]
    })

    client.on('playStillQualify', handlePlayQualify)
  }

  const handlePlayQualify = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length

    if (clientNumber > 1) return

    io.to(data.roomId).emit('unqualify')
  }

  client.on('createRoom', handleCreateRoom)
  client.on('joinRoom', handleJoinRoom)
  client.on('startGame', handleDealHand)
  client.on('leaveRoom', handleLeaveRoom)
  client.on('submitHand', handleSubmitHand)
})
server.listen(PORT, () => {
  console.log(`Connection listening on port ${PORT}`)
})
