import solver from 'pokersolver'

export const Hand = solver.Hand

// const test1 = Hand.solve(['As', '2d', '3h', '4h', '5h'])
// const test2 = Hand.solve(['As', '2d', '3h', '4h', '5h'])
// // const test2 = Hand.solve(['As', 'Td', 'Js', 'Qs', 'Ks'])
const test1 = [
  ['9c', '4d', '6c'],
  ['Ad', '4c', '8h', 'Qc', 'Jc'],
  ['4h', '6d', '8s', '8d', 'Tc']
]
const test2 = [
  ['2c', '9d', '6c'],
  ['Ad', '4c', '8h', 'Qc', 'Jc'],
  ['4h', '6d', '5s', '8d', '7c']
]
const test3 = [
  ['2c', '9d', '6c'],
  ['Ad', '4c', '8h', 'Qc', 'Jc'],
  ['6h', '6d', '8s', '8d', 'Tc']
]
const test4 = [
  ['2c', '9d', '9c'],
  ['Ad', '4c', 'Qh', 'Qc', 'Jc'],
  ['Th', 'Td', '8s', '8d', 'Tc']
]

export const checkWinner = (hand1, hand2) => {
  let result
  hand1 = Hand.solve(hand1)
  hand2 = Hand.solve(hand2)

  hand1.index = 0
  hand2.index = 1

  //Straight 5 Hight A,2,3,4,5
  const straightFiveHigh = 'Straight, 5 High'
  const straightAceHigh = 'Straight, A High'

  const winner = Hand.winners([hand1, hand2])

  // if (hand1.descr === hand2.descr) {
  //   return (result = 'tie')
  // }

  return (result = winner[0].index)
}

// console.log(checkWinner(test1[0], test2[0]))

export const checkQualify = (data) => {
  for (let i = 1; i < 3; i++) {
    if (checkWinner(data[0], data[i]) !== 1) {
      return false
    }
  }
  if (checkWinner(data[1], data[2]) !== 1) {
    false
  }
  return true
}

const compareTwoPlayer = (player1, player2) => {
  let player1Score = 0
  let player2Score = 0

  for (let i = 0; i < 3; i++) {
    const winner = checkWinner(player1[i], player2[i])

    if (winner === 0) {
      player1Score++
    } else if (winner === 1) {
      player2Score++
    }
  }

  return [{ player1: player1Score }, { player2: player2Score }]
}

export const convertHand = (hand) => {
  const newHand = []

  hand.forEach((card) => {
    let temp = ''
    switch (card.rank) {
      case 0:
        temp = temp + 'A'
        break
      case 9:
        temp = temp + 'T'
        break
      case 10:
        temp = temp + 'J'
        break
      case 11:
        temp = temp + 'Q'
        break
      case 12:
        temp = temp + 'K'
        break
      default:
        temp = card.rank + 1
    }

    switch (card.suit) {
      case 0:
        temp = temp + 's'
        break
      case 1:
        temp = temp + 'h'
        break
      case 2:
        temp = temp + 'c'
        break
      case 3:
        temp = temp + 'd'
        break
    }

    newHand.push(temp)
  })

  return newHand
}

const getSet = (hand) => {
  const set = new Set()
  hand.forEach((card) => {
    set.add(card.rank)
  })
  return Array.from(set).sort((a, b) => {
    return a - b
  })
}

const threeStraight = () => {}
const threeFlush = (hand) => {}
const sixPair = () => {}

const straightFlush = (hand) => {
  if (hand.length === 3) return false
  if (straight(hand) && flush(hand)) {
    return true
  }

  return false
}
const fourOfAKind = (hand) => {
  if (hand.length === 3) return false
  const cards = cardLayout(hand)
  if (cards.length !== 2) return false

  if (
    cards[0][Object.keys(cards[0])] === 4 ||
    cards[1][Object.keys(cards[1])] === 4
  )
    return true

  return false
}
const fullHouse = (hand) => {
  if (hand.length === 3) return false
  const cards = cardLayout(hand)
  if (cards.length !== 2) return false
  if (fourOfAKind(hand)) return false

  return true
}
const flush = (hand) => {
  const set = new Set()
  hand.forEach((card) => {
    set.add(card.suit)
  })
  if (set.size !== 1) {
    return false
  }
  return true
}
const straight = (hand) => {
  const cards = cardLayout(hand)
  const firstCard = Object.keys(cards[0])
  const lastCard = Object.keys(cards[cards.length - 1])

  if (hand.length === 5) {
    if (cards.length !== 5) return false
    if (lastCard - firstCard === 4) return true
    return false
  }
  // else if (hand.length === 3) {
  //   if (cards.length !== 3) return false
  //   if (lastCard - firstCard === 2) return true
  //   return false
  // }
}
const threeOfKind = (hand) => {
  const cards = cardLayout(hand)

  if (hand.length === 5) {
    if (cards.length !== 3) return false

    if (
      cards[0][Object.keys(cards[0])] === 3 ||
      cards[1][Object.keys(cards[1])] === 3 ||
      cards[2][Object.keys(cards[2])] === 3
    )
      return true
    return false
  } else if (hand.length === 3) {
    if (cards.length === 1) return true
    return false
  }
}
const twoPair = (hand) => {
  if (hand.length === 3) return false
  const cards = cardLayout(hand)
  if (cards.length !== 3) return false
  if (threeOfKind(hand)) return false

  const set = new Set()
  cards.forEach((card, index) => set.add(card[Object.keys(card)]))
  if (set.size === 2) return true

  return false
}
const pair = (hand) => {
  const cards = cardLayout(hand)

  if (hand.length === 5) {
    if (cards.length !== 4) return false
    return true
  } else if (hand.length === 3) {
    if (cards.length === 2) return true
    return false
  }
}
const highCard = (hand) => {
  const cards = cardLayout(hand)
  if (hand.length === 5) {
    if (cards.length !== 5) return false
    if (flush(hand)) return false
    if (straight(hand)) return false
    return true
  } else if (hand.length === 3) {
    if (cards.length !== 3) return false
    return true
  }
}
const checkHighFS = (hand1, hand2) => {
  hand1 = sortHand(hand1)
  hand2 = sortHand(hand2)
  for (let i = 0; i < hand1.length - 1; i++) {
    if (hand1[i] > hand2[i]) {
      return 1
    } else if (hand1[i] < hand2[i]) {
      return 2
    }
  }
  return 0
}

//need to check high pairs
const checkHighPair = (hand1, hand2) => {
  const set1 = cardLayout(hand1).filter((pair) => {
    if (pair[Object.keys(pair)] === 2) return Object.values(pair)
  })

  const set2 = cardLayout(hand2).filter((pair) => {
    if (pair[Object.keys(pair)] === 2) return Object.values(pair)
  })

  const keys1 = set1
    .map((set) => (Object.keys(set)[0] === '0' ? '14' : Object.keys(set)[0]))
    .sort()
  const keys2 = set2
    .map((set) => (Object.keys(set)[0] === '0' ? '14' : Object.keys(set)[0]))
    .sort()

  for (let i = 0; i < keys1.length - 1; i++) {
    if (keys1[i] > keys2[i]) {
      return 1
    } else if (keys1[i] < keys2[i]) {
      return 2
    }
  }

  //check hight card
  const h1 = cardLayout(hand1).filter((pair) => {
    if (pair[Object.keys(pair)] === 1) return Object.values(pair)
  })
  const h2 = cardLayout(hand2).filter((pair) => {
    if (pair[Object.keys(pair)] === 1) return Object.values(pair)
  })

  for (let i = 0; i < h1.length - 1; i++) {
    if (h1[i] > h2[i]) {
      return 1
    } else if (h1[i] < h2[i]) {
      return 2
    }
  }

  return 0
}

const checkHighCard = (hand1, hand2) => {}

const sortHand = (hand) => {
  const sorted = hand.sort((a, b) => b.rank - a.rank)

  return sorted
}

const cardLayout = (hand) => {
  let result = new Array(13).fill().map((_, index) => ({ [index]: 0 }))

  hand.forEach((card) => {
    const key = card.rank
    result[key][key]++
  })

  result = result.filter((card, index) => card[index] !== 0)

  return result
}

const handRank = (hand) => {
  if (straightFlush(hand)) return 8
  if (fourOfAKind(hand)) return 7
  if (fullHouse(hand)) return 6
  if (flush(hand)) return 5
  if (straight(hand)) return 4
  if (threeOfKind(hand)) return 3
  if (twoPair(hand)) return 2
  if (pair(hand)) return 1
  if (highCard(hand)) return 0
}

const compareHands = (hand1, hand2, hand3 = false, hand4 = false) => {
  const scoreBoard = [{ score: 0 }, { score: 0 }]
  if (hand3) {
    scoreBoard.push({ score: 0 })
  }
  if (hand4) {
    scoreBoard.push({ score: 0 })
  }

  const handleTie = (hand1, hand2) => {}

  const hands = [[...hand1], [...hand2], [...hand3], [...hand4]]
  // console.log(hands[0])
  // console.log('board ' + scoreBoard.length)

  for (let i = 0; i < scoreBoard.length - 1; i++) {
    for (let j = i + 1; j < 4; j++) {
      const handOneRank = handRank(hands[i][i])
      const otherRank = handRank(hands[j][i])
      // console.log('i = ' + i)
      // console.log(handOneRank)
      // console.log(otherRank)
      if (handOneRank > otherRank) {
        scoreBoard[i].score++
        scoreBoard[j].score--
      } else if (handOneRank < otherRank) {
        scoreBoard[i].score--
        scoreBoard[j].score++
      } else if (handOneRank === otherRank) {
        //check next hight card in hand.
      }
    }
  }

  console.log(scoreBoard)
}

// -3
//+3
const hand1 = [
  [
    { suit: 0, rank: 5 },
    { suit: 1, rank: 10 },
    { suit: 0, rank: 6 }
  ],
  [
    { suit: 2, rank: 0 },
    { suit: 2, rank: 3 },
    { suit: 2, rank: 3 },
    { suit: 0, rank: 12 },
    { suit: 2, rank: 12 }
  ],
  [
    { suit: 3, rank: 0 },
    { suit: 3, rank: 1 },
    { suit: 3, rank: 5 },
    { suit: 3, rank: 4 },
    { suit: 3, rank: 8 }
  ]
]
const hand2 = [
  [
    { suit: 2, rank: 7 },
    { suit: 2, rank: 11 },
    { suit: 2, rank: 9 }
  ],
  [
    { suit: 2, rank: 0 },
    { suit: 3, rank: 2 },
    { suit: 0, rank: 2 },
    { suit: 0, rank: 0 },
    { suit: 3, rank: 4 }
  ],
  [
    { suit: 3, rank: 0 },
    { suit: 0, rank: 0 },
    { suit: 2, rank: 6 },
    { suit: 3, rank: 10 },
    { suit: 1, rank: 10 }
  ]
]
const hand3 = [
  [
    { suit: 2, rank: 8 },
    { suit: 3, rank: 9 },
    { suit: 0, rank: 11 }
  ],
  [
    { suit: 3, rank: 0 },
    { suit: 2, rank: 0 },
    { suit: 2, rank: 5 },
    { suit: 2, rank: 4 },
    { suit: 3, rank: 1 }
  ],
  [
    { suit: 1, rank: 7 },
    { suit: 1, rank: 8 },
    { suit: 1, rank: 9 },
    { suit: 1, rank: 11 },
    { suit: 1, rank: 12 }
  ]
]
const hand4 = [
  [
    { suit: 3, rank: 5 },
    { suit: 0, rank: 6 },
    { suit: 3, rank: 6 }
  ],
  [
    { suit: 3, rank: 0 },
    { suit: 1, rank: 0 },
    { suit: 2, rank: 10 },
    { suit: 0, rank: 9 },
    { suit: 2, rank: 4 }
  ],
  [
    { suit: 2, rank: 8 },
    { suit: 1, rank: 9 },
    { suit: 0, rank: 10 },
    { suit: 3, rank: 11 },
    { suit: 2, rank: 12 }
  ]
]

// console.log(
//   handRank([
//     { suit: 0, rank: 5 },
//     { suit: 0, rank: 10 },
//     { suit: 0, rank: 6 }
//   ])
// )

// compareHands(hand1, hand2, hand3, hand4)
// console.log(setRanks())

checkHighPair(hand1[1], hand2[1])
