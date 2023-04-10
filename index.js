import express from 'express'
import cors from 'cors'
import * as http from 'http'
import { Server } from 'socket.io'
import Deck from './controllers/Deck.js'
import { createId, sortScoreboard } from './utilities/index.js'
import {
  compareHands,
  checkUserHand,
  assignScore
} from './controllers/gameLogic.js'

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
    client.leave(room)
    if (!roomState[room]) return
    const name = roomState[room]['player'][client.id].name
    console.log(`${name} disconnect from server`)
    delete roomState[room]['player'][client.id]
    resetPlayerStart(room)

    if (roomState[room]) {
      io.to(room).emit('playerLeft', {
        roomState: roomState[room]['player'],
        playerName: name
      })
    }
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
          startGame: false,
          hand: [],
          gong: false
        }
      },
      scoreBoard: {},
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

    //set user into roomstate
    roomState[data.roomId]['player'][client.id] = {
      name: data.playerName,
      totalScore: 0,
      currentScore: 0,
      clientId: client.id,
      autoWin: false,
      startGame: false,
      hand: [],
      gong: false
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
    if (!roomState[data.roomId]['player'][client.id]) {
      client.emit('roomClosed')
      return
    }
    //get number of players in room
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    const playerKeys = Object.keys(roomState[data.roomId]['player'])

    //user submit to start game
    roomState[data.roomId]['submitCount'][client.id] = true
    roomState[data.roomId]['player'][client.id]['startGame'] = true

    //if room doesn't have 2 or more player return
    if (clientNumber < 2) return

    //count how many player click start
    //return message to tell player to wait

    for (let i = 0; i < playerKeys.length; i++) {
      if (!roomState[data.roomId]['player'][playerKeys[i]].startGame) {
        client.emit('waitingOnPlayer')
        io.to(data.roomId).emit('playerClickStart', {
          roomState: roomState[data.roomId]['player']
        })
        return
      }
    }

    io.to(data.roomId).to(client.id).emit('ready')

    //create and shuffle deck
    const deck = new Deck()
    for (let i = 0; i < 5; i++) deck.shuffle()

    const hands = deck.deal_hand()

    //set start game back to false
    playerKeys.forEach((clientId) => {
      roomState[data.roomId]['player'][clientId]['hand'] = []
      roomState[data.roomId]['player'][clientId]['gong'] = false
      roomState[data.roomId]['player'][clientId].currentScore = 0
      roomState[data.roomId]['player'][clientId].autoWin = false
      roomState[data.roomId]['player'][clientId].startGame = false
    })

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
    if (!data.hand) return
    try {
      if (!roomState[data.roomId]) {
        client.emit('roomClosed')
        return
      }
      if (!roomState[data.roomId]['player'][client.id]) return
      // const roomSockets = await io.in(data.roomId).fetchSockets()
      // const clientNumber = roomSockets.length

      //user submit ready for hand.
      roomState[data.roomId]['submitCount'][client.id] = true
      roomState[data.roomId]['player'][client.id]['hand'] = [...data.hand]
      roomState[data.roomId]['player'][client.id]['startGame'] = true

      //get player keys from the room
      const playerKeys = Object.keys(roomState[data.roomId]['player'])

      //check for auto win

      //If not all user submit hand. tell user to wait.
      for (let i = 0; i < playerKeys.length; i++) {
        if (!roomState[data.roomId]['player'][playerKeys[i]].startGame) {
          client.emit('waiting')
          io.to(data.roomId).emit('playerSubmitHand', {
            roomState: roomState[data.roomId]['player']
          })
          return
        }
      }

      //reset Start Game
      playerKeys.forEach((key) => {
        roomState[data.roomId]['player'][key].startGame = false
      })

      //check if the hand submitted is qualify or not
      // subtract point from disqualify player
      //check for autoWin and add score to player

      const [hands, roomStateUpdate] = checkUserHand(
        playerKeys,
        roomState[data.roomId]['player']
      )

      //update roomstate with new stats
      roomState[data.roomId].player = { ...roomStateUpdate }

      //if more than 2 players qualify then compare hand
      if (hands && hands.length > 1) {
        const scores = compareHands(...hands)
        const updatedScore = assignScore(
          scores,
          roomState[data.roomId]['player']
        )
        roomState[data.roomId].player = { ...updatedScore }
      }

      io.to(data.roomId).emit('showHand', roomState[data.roomId])

      //reset currentScore for players
      playerKeys.forEach((key) => {
        roomState[data.roomId]['player'][key].startGame = false
        roomState[data.roomId]['scoreBoard'][
          roomState[data.roomId]['player'][key].name
        ] = roomState[data.roomId]['player'][key].totalScore
      })

      // sort scoreboard
      const sortedScoreboard = sortScoreboard(
        roomState[data.roomId]['scoreBoard']
      )
      roomState[data.roomId]['scoreBoard'] = sortedScoreboard

      io.to(data.roomId).emit(
        'scoreBoard',
        roomState[data.roomId]['scoreBoard']
      )

      hands.splice(0, hands.length)
      roomState[data.roomId]['submitCount'] = {}
      roomState[data.roomId]['playing'] = false
    } catch (error) {
      console.log(error)
    }
  }

  const handleLeaveRoom = async (data) => {
    client.leave(data.roomId)
    const room = await io.in(data.roomId).fetchSockets()
    if (roomState[data.roomId]['player'][client.id]) {
      delete roomState[data.roomId]['player'][client.id]
    }
    const playersInRoom = room.length

    if (playersInRoom > 0 && roomState[data.roomId]['player']) {
      const playerKeys = Object.keys(roomState[data.roomId]['player'])
      playerKeys.forEach(
        (player) => (roomState[data.roomId]['player'][player].startGame = false)
      )
      io.to(data.roomId).emit('playerLeft', {
        playerName: data.playerName,
        playersInRoom,
        roomState: roomState[data.roomId]['player']
      })
    }

    client.on('playStillQualify', handlePlayQualify)
  }

  const handlePlayQualify = async (data) => {
    try {
      const roomSockets = await io.in(data.roomId).fetchSockets()
      const clientNumber = roomSockets.length
      if (clientNumber > 1) return
      io.to(data.roomId).emit('unqualify')
    } catch (error) {
      console.log('handle play qualify error')
    }
  }

  const handleResetGame = (data) => {
    if (roomState[data.roomId]) {
      roomState[data.roomId]['playing'] = false
    }
  }

  const handleSendMessage = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()
    if (roomSockets) {
      io.to(data.roomId).emit('recievedMessage', {
        messageSender: data.playerName,
        message: data.message
      })
    }
  }

  client.on('createRoom', handleCreateRoom)
  client.on('joinRoom', handleJoinRoom)
  client.on('startGame', handleDealHand)
  client.on('resetGame', handleResetGame)
  client.on('leaveRoom', handleLeaveRoom)
  client.on('submitHand', handleSubmitHand)
  client.on('sendMessage', handleSendMessage)
  client.on('getRoomState', (data) => updateRoomState(data.roomId))
})

const resetPlayerStart = (roomId) => {
  const playerKeys = Object.keys(roomState[roomId]['player'])
  playerKeys.forEach(
    (key) => (roomState[roomId]['player'][key].startGame = false)
  )
}
const updateRoomState = (roomId) => {
  if (!roomId) return
  io.to(roomId).emit('playerJoin', {
    roomState: roomState[roomId]['player']
  })
}

server.listen(PORT, () => {
  console.log(`Connection listening on port ${PORT}`)
})
