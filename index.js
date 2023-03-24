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
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-requested-with'],
    credentials: true
  }
})

const roomState = {}

io.on('connection', async (client) => {
  // client.on('disconnecting', (reason)=> {

  // })

  const handleCreateRoom = (data) => {
    let roomId = createId()
    roomState[roomId] = {
      player: {
        [client.id]: {
          name: data.playerName,
          totalScore: 0,
          clientId: client.id,
          currentScore: 0
        }
      },
      submitCount: {}
    }

    client.join(roomId)

    client.emit('createdRoom', { clientId: client.id, roomId: roomId })
  }

  const handleJoinRoom = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()

    let currentRoomPlayer = roomSockets.length

    if (currentRoomPlayer === 0) {
      client.emit('unknowRoom')
      return
    } else if (currentRoomPlayer > 3) {
      client.emit('tooManyPlayers')
      return
    }

    roomState[data.roomId]['player'][client.id] = {
      name: data.playerName,
      totalScore: 0,
      currentScore: 0,
      clientId: client.id
    }

    client.join(data.roomId)

    client.emit('clientId', client.id)
    client.emit('roomId', data.roomId)
    const room = await io.in(data.roomId).fetchSockets()
    const playersInRoom = room.length
    console.log(playersInRoom)
    io.to(data.roomId).emit('playerJoin', {
      playerName: data.playerName,
      playersInRoom
    })
    // console.log(currentRoomPlayer)
  }

  const handleDealHand = async (data) => {
    //get number of players in room
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    roomState[data.roomId]['submitCount'][client.id] = true

    //if room doesn't have 2 or more player return
    if (clientNumber < 2) return

    //count how many player click start
    //return message to tell player to wait
    if (
      clientNumber !== Object.keys(roomState[data.roomId]['submitCount']).length
    ) {
      client.emit('waitingOnPlayer')
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

    //loop player list and send hand to player
    Object.keys(roomState[data.roomId]['player']).forEach((clientId, index) => {
      io.emit(clientId, hands[index])
    })
    //restart count
    roomState[data.roomId]['submitCount'] = {}
  }

  const handleSubmitHand = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    // const count = submitCount[data.roomId]

    roomState[data.roomId]['submitCount'][client.id] = true
    roomState[data.roomId]['player'][client.id]['hand'] = [...data.hand]

    //get player keys from the room
    const playerKeys = Object.keys(roomState[data.roomId]['player'])

    //check for auto win

    //If not all user submit hand. tell user to wait.
    if (
      Object.keys(roomState[data.roomId]['submitCount']).length !== clientNumber
    ) {
      client.emit('waiting')
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
        for (let j = 0; j < scores.length; j++) {
          if (
            Object.keys(scores[i])[0] ===
            Object.keys(roomState[data.roomId]['player'])[j]
          ) {
            roomState[data.roomId]['player'][
              Object.keys(roomState[data.roomId]['player'])[j]
            ]['currentScore'] = scores[i][Object.keys(scores[i])[0]].score
            roomState[data.roomId]['player'][
              Object.keys(roomState[data.roomId]['player'])[j]
            ].totalScore += scores[i][Object.keys(scores[i])[0]].score
          }
        }
      }
    }

    io.to(data.roomId).emit('showHand', roomState[data.roomId])

    //reset currentScore for players
    playerKeys.forEach(
      (key) => (roomState[data.roomId]['player'][key].currentScore = 0)
    )

    hands.splice(0, hands.length)
    roomState[data.roomId]['submitCount'] = {}
  }

  const handleLeaveRoom = async (data) => {
    client.leave(data.roomId)
    const room = await io.in(data.roomId).fetchSockets()
    const playersInRoom = room.length
    io.to(data.roomId).emit('playerLeft', {
      playerName: data.playerName,
      playersInRoom
    })
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
