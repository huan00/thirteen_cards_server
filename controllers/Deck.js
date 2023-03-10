class Card {
  constructor(rank, suit) {
    this.rank = rank
    this.suit = suit
  }

  getRank() {
    return this.rank
  }
  getSuit() {
    return this.suit
  }
}

class Deck {
  constructor() {
    this.deck = this.createDeck()
  }

  createDeck() {
    const deck = []
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 4; j++) {
        deck.push(new Card(i, j))
      }
    }
    return deck
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i)
      let temp = this.deck[i]
      this.deck[i] = this.deck[j]
      this.deck[j] = temp
    }
  }

  pop() {
    return this.deck.pop()
  }

  deal_hand() {
    const hands = [[], [], [], []]
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 4; j++) {
        hands[j].push(this.deck.pop())
      }
    }
    for (let i = 0; i < 4; i++) {
      hands[i] = hands[i].sort((a, b) => {
        return a.rank - b.rank
      })
    }
    return hands
  }
}

export default Deck
