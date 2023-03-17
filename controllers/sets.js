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

  return (result = winner[0].index)
}

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

//need to check high pairs
const checkHighPair = (hand1, hand2) => {
  const set1 = cardLayout(hand1)
    .filter((pair) => Object.values(pair)[0] === 2)
    .map((card) =>
      Object.keys(card)[0] === '0' ? 13 : parseInt(Object.keys(card)[0])
    )
    .sort((a, b) => b - a)

  const set2 = cardLayout(hand2)
    .filter((pair) => Object.values(pair)[0] === 2)
    .map((card) =>
      Object.keys(card)[0] === '0' ? 13 : parseInt(Object.keys(card)[0])
    )
    .sort((a, b) => b - a)

  for (let i = 0; i < set1.length; i++) {
    // console.log(set1[i])
    if (set1[i] > set2[i]) {
      return 1
    } else if (set1[i] < set2[i]) {
      console.log(set1[i])
      console.log(set2[i])
      return 2
    }
  }

  //check hight card
  const highCard1 = cardLayout(hand1)
    .filter((pair) => Object.values(pair)[0] === 1)
    .map((card) =>
      Object.keys(card)[0] === '0' ? 13 : parseInt(Object.keys(card)[0])
    )
    .sort((a, b) => b - a)
  const highCard2 = cardLayout(hand2)
    .filter((pair) => Object.values(pair)[0] === 1)
    .map((card) =>
      Object.keys(card)[0] === '0' ? 13 : parseInt(Object.keys(card)[0])
    )
    .sort((a, b) => b - a)

  for (let i = 0; i < set1.length; i++) {
    if (highCard1[i] > highCard2[i]) {
      return 1
    } else if (highCard1[i] < highCard2[i]) {
      return 2
    }
  }

  return 0
}

const checkHighTri = (hand1, hand2) => {
  const h1 = cardLayout(hand1).filter((card) => Object.values(card) > 2)
  const h2 = cardLayout(hand2).filter((card) => Object.values(card) > 2)

  if (h1[Object.keys(h1) > h2[Object.keys(h2)]]) {
    return 1
  } else if (h1[Object.keys(h1) < h2[Object.keys(h2)]]) {
    return 2
  }
}
const checkHighCard = (hand1, hand2) => {
  const h1 = getCardValue(hand1)
  const h2 = getCardValue(hand2)

  for (let i = 0; i < h1.length; i++) {
    if (h1[i] > h2[i]) {
      return 1
    } else if (h1[i] < h2[i]) {
      return 2
    }
  }
  return 0
}

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

const getCardValue = (hand) => {
  return cardLayout(hand)
    .map((card) => {
      if (Object.keys(card)[0] === '0') {
        return '13'
      } else return Object.keys(card)
    })
    .flat()
    .sort((a, b) => b - a)
}

const getCardKey = (hand) => {}

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

const handleTie = (hand1, hand2, rank) => {
  switch (rank) {
    case 8:
      return checkHighCard(hand1, hand2)
    case (7, 6, 3):
      return checkHighTri(hand1, hand2)
    case (5, 4):
      return checkHighCard(hand1, hand2)
    case 2:
      return checkHighPair(hand1, hand2)
    case 1:
      return checkHighPair(hand1, hand2)
    case 0:
      return checkHighCard(hand1, hand2)
  }
}

export const compareHands = (hand1, hand2, hand3 = false, hand4 = false) => {
  const scoreBoard = [{ score: 0 }, { score: 0 }]
  const hands = [[...hand1], [...hand2]]
  if (hand3) {
    scoreBoard.push({ score: 0 }), hands.push(hand3)
  }
  if (hand4) {
    scoreBoard.push({ score: 0 }), hands.push(hand4)
  }

  for (let i = 0; i < 4; i++) {
    const compareHand = hands[i]
    for (let j = i + 1; j < 4; j++) {
      const compareTo = hands[j]
      for (let k = 0; k < 3; k++) {
        const h1 = handRank(compareHand[k])
        const h2 = handRank(compareTo[k])

        if (h1 > h2) {
          scoreBoard[i].score++
          scoreBoard[j].score--
        } else if (h1 < h2) {
          scoreBoard[i].score--
          scoreBoard[j].score++
        } else if (h1 === h2) {
          const tie = handleTie(compareHand[k], compareTo[k], h1)
          if (tie === 1) {
            scoreBoard[i].score++
            scoreBoard[j].score--
          } else if (tie === 2) {
            scoreBoard[i].score--
            scoreBoard[j].score++
          }
        }
      }
    }
  }

  return scoreBoard
}

const hand1 = [
  [
    { suit: 0, rank: 5 },
    { suit: 1, rank: 10 },
    { suit: 0, rank: 6 }
  ],
  [
    { suit: 2, rank: 0 },
    { suit: 2, rank: 4 },
    { suit: 2, rank: 0 },
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
    { suit: 3, rank: 12 },
    { suit: 0, rank: 12 },
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
