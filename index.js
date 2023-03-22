import express from 'express'
import cors from 'cors'
import * as http from 'http'
import { Server } from 'socket.io'
import Deck from './controllers/Deck.js'
import { createId } from './utilities/index.js'
import { compareHands } from './controllers/sets.js'

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

// const clientRooms = {}

// let playerNumber = 1
const startCount = new Set()
const submitCount = {}
const roomState = {}
// {:  players: { name: '', clientId: '', score } }

io.on('connection', async (client) => {
  // client.on('disconnecting', (reason)=> {

  // })

  const handleCreateRoom = (data) => {
    let roomId = createId()
    // clientRooms[client.id] = roomId
    roomState[roomId] = {
      player: {
        [client.id]: {
          name: data.playerName,
          totalScore: 0,
          clientId: client.id
        }
      },
      submitCount: {}
    }

    submitCount[roomId] = {}

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

    // clientRooms[client.id] = roomId
    roomState[data.roomId]['player'][client.id] = {
      name: data.playerName,
      totalScore: 0
    }

    client.join(data.roomId)
    // client.number = playerNumber
    // playerNumber += 1

    client.emit('clientId', client.id)
    client.emit('roomId', data.roomId)
  }

  const handleDealHand = async (roomId) => {
    //get number of players in room
    const roomSockets = await io.in(roomId).fetchSockets()
    const clientNumber = roomSockets.length

    //count how many player click start
    startCount.add(client.id)
    //return message to tell player to wait
    if (clientNumber !== startCount.size) {
      client.emit('waitingOnPlayer')
      return
    }

    //emit ready to all player
    io.to(roomId).to(client.id).emit('ready')

    //create and shuffle deck
    const deck = new Deck()
    deck.shuffle()
    deck.shuffle()
    deck.shuffle()
    const hands = deck.deal_hand()

    //loop player list and send hand to player
    Array.from(startCount).forEach((clientId, index) => {
      io.emit(clientId, hands[index])
    })
    //restart count
    startCount.clear()
  }

  const handleSubmitHand = async (data) => {
    const roomSockets = await io.in(data.roomId).fetchSockets()
    const clientNumber = roomSockets.length
    const count = submitCount[data.roomId]

    roomState[data.roomId]['submitCount'][client.id] = true

    roomState[data.roomId]['player'][client.id]['hand'] = [...data.hand]

    count[client.id] = {
      hand: data.hand,
      playerName: data.playerName,
      clientId: client.id
    }

    const playerKeys = Object.keys(roomState[data.roomId]['player'])
    console.log(Object.keys(roomState[data.roomId]['submitCount']).length)

    // console.log(roomState[data.roomId]['player'][someKeys[0].hand])

    // const playerKeys = Object.keys(count)

    //If not all user submit hand. tell user to wait.
    if (
      Object.keys(roomState[data.roomId]['submitCount']).length !== clientNumber
    ) {
      client.emit('waiting')
      return
    }

    const hands = playerKeys.map((key) => ({
      hand: roomState[data.roomId]['player'][key].hand,
      playerName: key
    }))
    // console.log(...hands)

    const scores = compareHands(...hands)
    console.log(scores)

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

    // console.log(scoreBoard[data.roomId])

    console.log(roomState[data.roomId])

    io.to(data.roomId).emit('showHand', roomState[data.roomId])

    roomState[data.roomId]['submitCount'] = {}
  }

  client.on('createRoom', handleCreateRoom)
  client.on('joinRoom', handleJoinRoom)
  client.on('startGame', handleDealHand)
  client.on('getNumPlayer', async (roomId) => {
    const player = io.in(roomId)
  })
  client.on('submitHand', handleSubmitHand)
})
server.listen(PORT, () => {
  console.log(`Connection listening on port ${PORT}`)
})
