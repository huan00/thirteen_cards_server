const hand = [
  { rank: 6, suit: 3 },
  { rank: 6, suit: 0 },
  { rank: 3, suit: 1 },
  { rank: 3, suit: 2 },
  { rank: 7, suit: 3 }
]

const highCard = (hand) => {
  const length = hand.length

  const set = new Set()
  hand.forEach((card) => {
    set.add(card.rank)
  })
  if (length === 3 && set.size === 3) {
    return true
  } else if (length === 5 && set.size === 5) {
    return true
  }
  return false
}

const onePair = (hand) => {
  const length = hand.length

  const set = new Set()
  hand.forEach((card) => {
    set.add(card.rank)
  })
  if (length === 3 && set.size === 2) {
    return true
  } else if (length === 5 && set.size === 4) {
    return true
  }
  return false
}

const twoPair = (hand) => {
  const length = hand.length

  if (length < 5) return false

  const set = new Set()
  hand.forEach((card) => {
    set.add(card.rank)
  })

  if (length === 5 && set.size === 3) {
    return true
  }
  return false
}

const threeOfKind = (hand) => {
  const count = 0
  // hand.forEach(card=> {
  //   if card.rank
  // })
  // const
}
const straight = () => {}
const flush = () => {}
const fullHouse = () => {}
const fourOfKind = () => {}
const straightFlush = () => {}

console.log(twoPair(hand))
