export const createId = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 5; i++) {
    id += characters[Math.floor(Math.random() * characters.length)]
  }

  return id
}

// export default createId
