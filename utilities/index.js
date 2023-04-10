export const createId = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 5; i++) {
    id += characters[Math.floor(Math.random() * characters.length)]
  }

  return id
}

// export default createId

export const sortScoreboard = (scoreboard) => {
  const sorted = Object.fromEntries(
    Object.entries(scoreboard).sort(([, a], [, b]) => b - a)
  )

  return sorted
}
