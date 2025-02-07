import { useState, useEffect, useRef } from 'react';

const Deck = () => {
  const [deckId, setDeckId] = useState(null);
  const [card, setCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);
  const drawInterval = useRef(null);

  useEffect(() => {
    async function fetchDeck() {
      try {
        const response = await fetch(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        );
        const data = await response.json();
        console.log(data);
        setDeckId(data.deck_id);
      } catch (error) {
        console.error('Error fetching deck...', error);
      }
    }

    fetchDeck();
  }, []); // Only run once component mounts

  async function drawCard() {
    try {
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
      );
      const data = await response.json();

      if (data.remaining === 0) {
        alert('Error: No cards remaining!');
        stopAutoDraw();
        return;
      }

      console.log('Card drawn', data.cards[0]);
      setCard(data.cards[0]);
    } catch (error) {
      console.log('Error drawing a card...', error);
    }
  }

  async function shuffleDeck() {
    try {
      setIsShuffling(true);
      stopAutoDraw();
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`
      );
      const data = await response.json();
      console.log('Deck Shuffled', data);
      setCard(null);
    } catch (error) {
      console.log('Error shuffling deck...', error);
    } finally {
      setIsShuffling(false);
    }
  }

  function startAutoDraw() {
    if (!drawInterval.current) {
      setIsAutoDrawing(true);
      drawInterval.current = setInterval(() => {
        drawCard();
      }, 1000);
    }
  }

  function stopAutoDraw() {
    if (drawInterval.current) {
      clearInterval(drawInterval.current);
      drawInterval.current = null;
      setIsAutoDrawing(false);
    }
  }

  return (
    <div>
      <h1>Card Drawing App</h1>
      {deckId ? <p>Deck ID: {deckId}</p> : <p>Loading deck...</p>}
      <button onClick={drawCard} disabled={!deckId || isShuffling}>
        Draw a Card
      </button>
      <button onClick={shuffleDeck} disabled={!deckId || isShuffling}>
        {isShuffling ? 'Shuffling...' : 'Shuffle Deck'}
      </button>
      <button
        onClick={isAutoDrawing ? stopAutoDraw : startAutoDraw}
        disabled={!deckId || isShuffling}
      >
        {isAutoDrawing ? 'Stop Drawing' : 'Start Auto-Draw'}
      </button>

      {card && (
        <div>
          <h2>
            {card.value} of {card.suit}
          </h2>
          <img src={card.image} alt={`${card.value} of ${card.suit}`} />
        </div>
      )}
    </div>
  );
};

export default Deck;
