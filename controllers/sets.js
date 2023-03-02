import solver from 'pokersolver'
const handSolver = solver.Hand

// const hand = [
//   { rank: 0, suit: 3 },
//   { rank: 1, suit: 0 },
//   { rank: 1, suit: 1 },
//   { rank: 1, suit: 3 },
//   { rank: 2, suit: 2 }
// ]

// console.log(handSolver)
// // console.log(Hand.Hand.solve(['Ad', '2d', 'As', '2s', '2c']).name)

// const highCard = (hand) => {
//   const length = hand.length
//   const set = getSet(hand)

//   if (length === 3 && set.length === 3) {
//     return true
//   } else if (length === 5 && set.length === 5 && !straight(hand)) {
//     return true
//   }
//   return false
// }

// const onePair = (hand) => {
//   const length = hand.length
//   const set = getSet(hand)

//   if (length === 3 && set.length === 2) {
//     return true
//   } else if (length === 5 && set.length === 4) {
//     return true
//   }
//   return false
// }

// //need work
// const twoPair = (hand) => {
//   const length = hand.length
//   if (length < 5) return false //return for top hand
//   const set = getSet(hand)

//   const firstThird = getSet(hand.slice(0, 3))
//   const lastThird = getSet(hand.slice(3, length - 1))
//   console.log(hand.slice(2, length))

//   if (
//     set.length === 3 &&
//     (hand[1].rank === hand[0].rank || hand[1].rank === hand[2].rank) &&
//     (hand[3].rank === hand[2].rank || hand[3].rank === hand[length - 1].rank) &&
//     !fullHouse(hand)
//   ) {
//     return true
//   }
//   return false
// }

// // need work
// const threeOfKind = (hand) => {
//   const length = hand.length
//   const set = getSet(hand)
//   console.log(set.length)
//   if (length === 3 && set.length === 1) {
//     return true
//   } else if (length === 5 && set.length === 3 && !twoPair(hand)) {
//     return true
//   }
//   return false
// }
// const straight = (hand) => {
//   const length = hand.length
//   if (length < 5) return false
//   const set = getSet(hand)

//   if (set.length === 5 && hand[length - 1].rank - hand[0].rank === 4)
//     return true

//   return false
// }
// const flush = () => {}
// const fullHouse = () => {}
// const fourOfKind = () => {}
// const straightFlush = () => {}

// const getSet = (hand) => {
//   const set = new Set()
//   hand.forEach((card) => {
//     set.add(card.rank)
//   })
//   return Array.from(set).sort((a, b) => {
//     return a - b
//   })
}

// console.log(twoPair(hand))
