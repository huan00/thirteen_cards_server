import express from 'express'
import cors from 'cors'
import * as http from 'http'
import { Server } from 'socket.io'
import Deck from './controllers/Deck.js'
import { createId } from './utilities/index.js'

const PORT = process.env.PORT || 3001
const app = express()
app.use(cors())
const server = http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:19006', 'http://localhost:19000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-requested-with'],
    credentials: true
  }
})

const clientRooms = {}
let numPlayers = []

io.on('connection', (client) => {
  // io.emit('clientId', client.id)

  const handleNewGame = () => {
    let roomId = createId()

    clientRooms[client.id] = roomId

    numPlayers.push(client.id)
    // client.emit('roomId', roomId)
    client.emit('playerNumber', { room: roomId, player: client.id })
    client.join(roomId)
  }

  const handleJoinGame = async (roomId) => {
    //check to see how many player in room
    const roomExist = io.in(roomId).adapter.rooms.has(roomId)
    const players = io.in(roomId).adapter.rooms.get(roomId)

    if (!roomExist && (players?.size === undefined || players.size > 4)) {
      //return if room doesn't exist or room have more than 4 players
      return
    } else {
      //join game
      client.join(roomId)
      numPlayers.push(client.id)
      client.emit('playerNumber', { room: roomId, player: client.id })
      io.sockets.in(roomId).emit('connectToRoom', `${client.id} join the game`)
    }
  }

  const handleDealHand = (id) => {
    //create new deck and shuffle it then deal 4 hands
    const deck = new Deck()
    deck.shuffle()
    const hands = deck.deal_hand()

    //get num player in room and send hand to them.
    const players = io.in(id)
    const list = players.adapter.rooms.get(id)
    const playerList = Array?.from(list)

    //loop player list and send hand to player
    playerList.forEach((player, index) => {
      io.emit(player, hands[index])
    })
  }

  client.on('room', handleNewGame)
  client.on('joinGame', handleJoinGame)
  client.on('getHand', handleDealHand)
  client.on('getNumPlayer', async (roomId) => {
    const player = io.in(roomId)
    console.log(player.adapter.rooms.size)
  })
  // const numPlayer = io.sockets.adapter.rooms.get('room1')
  // console.log(numPlayer.size)
})
server.listen(PORT, () => {
  console.log(`Connection listening on port ${PORT}`)
})
