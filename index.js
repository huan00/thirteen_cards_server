import express from 'express'
import cors from 'cors'
import * as http from 'http'
import { Server } from 'socket.io'
import Deck from './controllers/Deck.js'
import { createId } from './utilities/index.js'
import {
  checkWinner,
  compareHands,
  convertHand,
  Hand
} from './controllers/sets.js'

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

const clientRooms = {}
const state = {}
let playerNumber = 1
const startCount = new Set()
const submitCount = {}
const submitHand = {}

io.on('connection', async (client) => {
  const handleCreateRoom = () => {
    let roomId = createId()
    clientRooms[client.id] = roomId
    submitCount[roomId] = {}

    client.join(roomId)

    client.emit('createdRoom', { clientId: client.id, roomId: roomId })
  }

  const handleJoinRoom = async (roomId) => {
    const roomSockets = await io.in(roomId).fetchSockets()

    let currentRoomPlayer = roomSockets.length

    if (currentRoomPlayer === 0) {
      client.emit('unknowRoom')
      return
    } else if (currentRoomPlayer > 3) {
      client.emit('tooManyPlayers')
      return
    }

    clientRooms[client.id] = roomId

    client.join(roomId)
    client.number = playerNumber
    playerNumber += 1

    client.emit('clientId', client.id)
    client.emit('roomId', roomId)
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
    // console.log(roomSockets)
    const clientNumber = roomSockets.length
    const count = submitCount[data.roomId]
    count[client.id] = { hand: data.hand, playerName: data.playerName }

    const playerKeys = Object.keys(count)
    const hands = playerKeys.map((hand) => count[hand])
    console.log(hands)

    //If not all user submit hand. tell user to wait.
    if (Object.keys(count).length !== clientNumber) {
      client.emit('waiting')
      return
    }

    const scores = compareHands(...hands)
    for (let i = 0; i < scores.length; i++) {
      for (let j = 0; j < scores.length; j++) {
        if (Object.keys(scores[i])[0] === hands[j].playerName) {
          hands[j]['score'] = scores[i][Object.keys(scores[i])[0]].score
        }
      }
    }
    // hands[0]['score'] = 3
    hands.sort((a, b) => a.playerName - b.playerName)

    io.to(data.roomId).emit('showHand', count)

    // console.log(submitCount[data.roomId])
    //collect all hands submitted
    // convert hand
    // const topSet = convertHand(data.hand[0])
    // const midSet = convertHand(data.hand[1])
    // const bottomSet = convertHand(data.hand[2])
    // submitHand[client.id] = [[...topSet], [...midSet], [...bottomSet]]

    // console.log(checkWinner(midSet, bottomSet))
    // console.log(data.hand)

    submitCount[data.roomId] = {}
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
