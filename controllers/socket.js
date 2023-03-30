import { io } from '../index.js'
import { createId } from '../utilities/index.js'

io.on('createRoom', (client) => {
  const room = createId
  client.join(room)

  client.in(room).emit('roomId', room)
})
