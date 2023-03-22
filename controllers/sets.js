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
  if (hand.length < 5) return false
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
    if (set1[i] > set2[i]) {
      return 1
    } else if (set1[i] < set2[i]) {
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
    if (parseInt(h1[i]) > parseInt(h2[i])) {
      return 1
    } else if (parseInt(h1[i]) < parseInt(h2[i])) {
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
    case 7:
    case 6:
    case 3:
      return checkHighTri(hand1, hand2)
    case 5:
    case 4:
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
  const scoreBoard = [
    { [hand1.playerName]: { score: 0 } },
    { [hand2.playerName]: { score: 0 } }
  ]
  // const scoreKeys = Object.keys(scoreBoard)
  const hands = [hand1.hand, hand2.hand]
  if (hand3) {
    scoreBoard.push({ [hand3.playerName]: { score: 0 } }),
      hands.push(hand3.hand)
  }
  if (hand4) {
    scoreBoard.push({ [hand4.playerName]: { score: 0 } }),
      hands.push(hand4.hand)
  }

  // console.log(hand1)

  for (let i = 0; i < hands.length; i++) {
    const compareHand = hands[i]

    for (let j = i + 1; j < hands.length; j++) {
      const compareTo = hands[j]
      // console.log(compareHand)
      // console.log(compareTo)
      for (let k = 0; k < 3; k++) {
        const h1 = handRank(compareHand[k])
        const h2 = handRank(compareTo[k])
        if (h1 > h2) {
          scoreBoard[i][Object.keys(scoreBoard[i])].score++
          scoreBoard[j][Object.keys(scoreBoard[j])].score--
        } else if (h1 < h2) {
          scoreBoard[i][Object.keys(scoreBoard[i])].score--
          scoreBoard[j][Object.keys(scoreBoard[j])].score++
        } else if (h1 === h2) {
          const tie = handleTie(compareHand[k], compareTo[k], h1)
          if (tie === 1) {
            scoreBoard[i][Object.keys(scoreBoard[i])].score++
            scoreBoard[j][Object.keys(scoreBoard[j])].score--
          } else if (tie === 2) {
            scoreBoard[i][Object.keys(scoreBoard[i])].score--
            scoreBoard[j][Object.keys(scoreBoard[j])].score++
          }
        }
      }
    }
  }
  return scoreBoard
}

const hand1 = {
  playerName: 'one',
  hand: [
    [
      {
        suit: 0,
        rank: 0
      },
      {
        suit: 0,
        rank: 11
      },
      {
        suit: 1,
        rank: 10
      }
    ],
    [
      {
        suit: 0,
        rank: 1
      },
      {
        suit: 0,
        rank: 7
      },
      {
        suit: 3,
        rank: 7
      },
      {
        suit: 1,
        rank: 9
      },
      {
        suit: 3,
        rank: 4
      }
    ],
    [
      {
        suit: 2,
        rank: 0
      },
      {
        suit: 2,
        rank: 3
      },
      {
        suit: 2,
        rank: 6
      },
      {
        suit: 2,
        rank: 11
      },
      {
        suit: 2,
        rank: 12
      }
    ]
  ]
}

const hand2 = {
  playerName: 'two',
  hand: [
    [
      {
        suit: 2,
        rank: 8
      },
      {
        suit: 2,
        rank: 10
      },
      {
        suit: 3,
        rank: 11
      }
    ],
    [
      {
        suit: 2,
        rank: 1
      },
      {
        suit: 3,
        rank: 2
      },
      {
        suit: 3,
        rank: 5
      },
      {
        suit: 2,
        rank: 5
      },
      {
        suit: 0,
        rank: 3
      }
    ],
    [
      {
        suit: 1,
        rank: 0
      },
      {
        suit: 1,
        rank: 1
      },
      {
        suit: 1,
        rank: 3
      },
      {
        suit: 1,
        rank: 4
      },
      {
        suit: 1,
        rank: 7
      }
    ]
  ]
}
const hand3 = {
  playerName: 'three',
  hand: [
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
}
const hand4 = {
  playerName: 'four',
  hand: [
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
}
// const all = [hand1, hand2, hand3, hand4]
// console.log(all)
// console.log(compareHands(...all))
