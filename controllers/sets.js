import solver from 'pokersolver'
const handSolver = solver.Hand

// const hand = [
//   { rank: 0, suit: 3 },
//   { rank: 1, suit: 0 },
//   { rank: 1, suit: 1 },
//   { rank: 1, suit: 3 },
//   { rank: 2, suit: 2 }
// ]

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
