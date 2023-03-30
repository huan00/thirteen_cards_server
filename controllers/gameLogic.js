export const checkQualify = (hand) => {
  //check if top < mid < bottom
  const top = handRank(hand[0])
  const mid = handRank(hand[1])
  const bottom = handRank(hand[2])

  //check if mid hand is greater than top
  if (top > mid) {
    return false
  } else if (top === mid) {
    const tie = handleTie(hand[0], hand[1], mid)
    if (tie === 1) return false
  }
  //check bottom is greater than mid
  if (mid > bottom) {
    return false
  } else if (mid === bottom) {
    const tie = handleTie(hand[1], hand[2], bottom)
    if (tie === 1) return false
  }

  //hand quality
  return true
}

const threeStraight = (hand) => {
  const top = cardLayout(hand[0])
  const mid = cardLayout(hand[1])
  const bottom = cardLayout(hand[2])

  if (
    top.length !== 3 ||
    parseInt(Object.keys(top[2])[0]) - parseInt(Object.keys(top[0])[0]) !== 2
  ) {
    return false
  }
  if (
    mid.length !== 5 ||
    parseInt(Object.keys(mid[4])[0]) - parseInt(Object.keys(mid[0])[0]) !== 4
  ) {
    return false
  }
  if (
    bottom.length !== 5 ||
    parseInt(Object.keys(bottom[4])[0]) -
      parseInt(Object.keys(bottom[0])[0]) !==
      4
  ) {
    return false
  }

  return true
}
const threeFlush = (hand) => {
  const top = new Set(
    hand[0].map((card) => {
      return card.suit
    })
  )
  const mid = new Set(
    hand[1].map((card) => {
      return card.suit
    })
  )
  const bottom = new Set(
    hand[2].map((card) => {
      return card.suit
    })
  )

  if (top.size !== 1) return false
  if (mid.size !== 1) return false
  if (bottom.size !== 1) return false

  return true
}
const sixPair = (hand) => {
  const pairs = cardLayout(hand.flat())
  if (pairs.length !== 7) return false

  const values = new Set(
    pairs.map((pair) => {
      return Object.values(pair)[0]
    })
  )

  if (values.size !== 2) return false

  return true
}

const dragon = (hand) => {
  const layout = cardLayout(hand.flat())

  if (layout.length !== 13) return false

  return true
}

export const checkAuto = (hand) => {
  if (threeStraight(hand)) return true
  if (threeFlush(hand)) return true
  if (sixPair(hand)) return true
  if (dragon(hand)) return true

  return false
}

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
  const keys = cards.map((card) => parseInt(Object.keys(card)[0]))

  if (hand.length === 5) {
    if (keys.length !== 5) return false
    if (keys[0] === 0 && keys[4] === 12) {
      keys.splice(0, 1)
      keys.splice(keys.length, 0, 13)
    }
    if (keys[4] - keys[0] === 4) return true
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
  const h1 =
    parseInt(
      Object.keys(
        cardLayout(hand1).filter((card) => Object.values(card) > 2)[0]
      )[0]
    ) === 0
      ? 13
      : parseInt(
          Object.keys(
            cardLayout(hand1).filter((card) => Object.values(card) > 2)[0]
          )[0]
        )
  const h2 =
    parseInt(
      Object.keys(
        cardLayout(hand2).filter((card) => Object.values(card) > 2)[0]
      )[0]
    ) === 0
      ? 13
      : parseInt(
          Object.keys(
            cardLayout(hand2).filter((card) => Object.values(card) > 2)[0]
          )[0]
        )

  if (h1 > h2) {
    return 1
  } else if (h1 < h2) {
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

const scoreSystem = (rank, set) => {
  switch (rank) {
    case 8:
      if (set === 1) {
        return 10
      }
      return 5
    case 7:
      if (set === 1) {
        return 8
      }
      return 4
    case 6:
      if (set === 1) {
        return 2
      }
      return 1
    case 3:
      if (set === 0) {
        return 3
      }
      return 1
    default:
      return 1
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

  for (let i = 0; i < hands.length; i++) {
    const compareHand = hands[i]

    for (let j = i + 1; j < hands.length; j++) {
      const compareTo = hands[j]
      for (let k = 0; k < 3; k++) {
        const h1 = handRank(compareHand[k])
        const h2 = handRank(compareTo[k])

        const score = scoreSystem(Math.max(h1, h2), k)
        if (h1 > h2) {
          scoreBoard[i][Object.keys(scoreBoard[i])].score += score
          scoreBoard[j][Object.keys(scoreBoard[j])].score -= score
        } else if (h1 < h2) {
          scoreBoard[i][Object.keys(scoreBoard[i])].score -= score
          scoreBoard[j][Object.keys(scoreBoard[j])].score += score
        } else if (h1 === h2) {
          const tie = handleTie(compareHand[k], compareTo[k], h1)

          if (tie === 1) {
            scoreBoard[i][Object.keys(scoreBoard[i])].score += score
            scoreBoard[j][Object.keys(scoreBoard[j])].score -= score
          } else if (tie === 2) {
            scoreBoard[i][Object.keys(scoreBoard[i])].score -= score
            scoreBoard[j][Object.keys(scoreBoard[j])].score += score
          }
        }
      }
    }
  }
  return scoreBoard
}

export const checkUserHand = (keys, roomState) => {
  const hands = []
  const roomStateUpdate = { ...roomState }
  keys.forEach((key) => {
    const hand = roomStateUpdate[key].hand

    if (checkQualify(hand)) {
      if (checkAuto(hand)) {
        const winnerKey = key
        const points = (keys.length - 1) * 5

        roomStateUpdate[winnerKey].currentScore += points
        roomStateUpdate[winnerKey].totalScore += points
        roomStateUpdate[winnerKey].autoWin = true

        keys.forEach((playerKey) => {
          if (playerKey !== winnerKey) {
            roomStateUpdate[playerKey].currentScore -= 5
            roomStateUpdate[playerKey].totalScore -= 5
          }
        })
      } else {
        hands.push({
          hand: hand,
          playerName: key
        })
      }
    } else {
      const disqualify = key
      const points = (keys.length - 1) * 3
      roomStateUpdate[disqualify].currentScore -= points
      roomStateUpdate[disqualify].totalScore -= points

      keys.forEach((playerKey) => {
        if (playerKey !== disqualify) {
          roomStateUpdate[playerKey].currentScore += 3
          roomStateUpdate[playerKey].totalScore += 3
        }
      })
    }
  })
  return [hands, roomStateUpdate]
}

export const assignScore = (scores, roomState) => {
  const roomStateUpdate = { ...roomState }
  for (let i = 0; i < scores.length; i++) {
    for (let j = 0; j < Object.keys(roomStateUpdate).length; j++) {
      if (Object.keys(scores[i])[0] === Object.keys(roomStateUpdate)[j]) {
        //current score
        roomStateUpdate[Object.keys(roomStateUpdate)[j]]['currentScore'] +=
          scores[i][Object.keys(scores[i])[0]].score

        //total score
        roomStateUpdate[Object.keys(roomStateUpdate)[j]].totalScore +=
          scores[i][Object.keys(scores[i])[0]].score
      }
    }
  }

  return roomStateUpdate
}

const hand1 = {
  playerName: 'one',
  hand: [
    [
      {
        suit: 0,
        rank: 1
      },
      {
        suit: 0,
        rank: 2
      },
      {
        suit: 0,
        rank: 11
      }
    ],
    [
      {
        suit: 1,
        rank: 1
      },
      {
        suit: 0,
        rank: 1
      },
      {
        suit: 3,
        rank: 1
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
        suit: 1,
        rank: 9
      },
      {
        suit: 2,
        rank: 9
      },
      {
        suit: 2,
        rank: 9
      },
      {
        suit: 2,
        rank: 10
      },
      {
        suit: 2,
        rank: 7
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
        rank: 1
      },
      {
        suit: 2,
        rank: 2
      },
      {
        suit: 3,
        rank: 3
      }
    ],
    [
      {
        suit: 2,
        rank: 3
      },
      {
        suit: 3,
        rank: 4
      },
      {
        suit: 3,
        rank: 5
      },
      {
        suit: 2,
        rank: 7
      },
      {
        suit: 0,
        rank: 6
      }
    ],
    [
      {
        suit: 1,
        rank: 7
      },
      {
        suit: 1,
        rank: 8
      },
      {
        suit: 1,
        rank: 9
      },
      {
        suit: 1,
        rank: 10
      },
      {
        suit: 1,
        rank: 11
      }
    ]
  ]
}
const hand3 = {
  playerName: 'three',
  hand: [
    [
      { suit: 0, rank: 0 },
      { suit: 0, rank: 4 },
      { suit: 0, rank: 12 }
    ],
    [
      { suit: 2, rank: 0 },
      { suit: 2, rank: 7 },
      { suit: 2, rank: 2 },
      { suit: 2, rank: 8 },
      { suit: 2, rank: 9 }
    ],
    [
      { suit: 1, rank: 1 },
      { suit: 1, rank: 1 },
      { suit: 1, rank: 6 },
      { suit: 1, rank: 6 },
      { suit: 1, rank: 6 }
    ]
  ]
}
const hand4 = {
  playerName: 'four',
  hand: [
    [
      { suit: 1, rank: 9 },
      { suit: 2, rank: 10 },
      { suit: 3, rank: 12 }
    ],
    [
      { suit: 2, rank: 1 },
      { suit: 3, rank: 3 },
      { suit: 2, rank: 8 },
      { suit: 3, rank: 8 },
      { suit: 2, rank: 5 }
    ],
    [
      { suit: 1, rank: 1 },
      { suit: 1, rank: 2 },
      { suit: 1, rank: 3 },
      { suit: 1, rank: 4 },
      { suit: 1, rank: 5 }
    ]
  ]
}
// const all = [hand1, hand2, hand3, hand4]
// console.log(all)
// console.log(compareHands(hand3, hand4))
// console.log(checkQualify(hand4.hand))

// console.log(Object.values(cardLayout(hand1.hand[0])[0]))

// console.log(sixPair(hand1.hand.flat()))
// console.log(hand1.hand)

// console.log(checkAuto(hand3.hand))

// console.log(threeFlush(hand3.hand))
// console.log(flush(hand3.hand[1]))
// console.log(dragon(hand4.hand))

// console.log(cardLayout(hand1.hand.flat()))
// checkHighTri(hand1.hand[1], hand1.hand[2])

// export const testHand = [
//   { rank: 0, suit: 1 },
//   { rank: 1, suit: 1 },
//   { rank: 2, suit: 1 },
//   { rank: 2, suit: 2 },
//   { rank: 5, suit: 2 },
//   { rank: 4, suit: 2 },
//   { rank: 6, suit: 2 },
//   { rank: 7, suit: 2 },
//   { rank: 8, suit: 3 },
//   { rank: 9, suit: 3 },
//   { rank: 10, suit: 3 },
//   { rank: 11, suit: 3 },
//   { rank: 12, suit: 3 }
// ]
