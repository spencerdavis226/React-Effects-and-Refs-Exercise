import { useState, useEffect, useRef } from 'react';

const Deck = () => {
  // Stores the deck ID so we can interact with the same deck throughout the app
  const [deckId, setDeckId] = useState(null);

  // Stores the most recently drawn card
  const [card, setCard] = useState(null);

  // Tracks if the deck is currently being shuffled (used to disable buttons)
  const [isShuffling, setIsShuffling] = useState(false);

  // Tracks if auto-draw is active (used to change button text and prevent manual draws)
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);

  // Stores the interval ID for auto-drawing (useRef prevents re-renders when modified)
  const drawInterval = useRef(null);

  // Fetches a new deck from the API when the component first mounts
  useEffect(() => {
    async function fetchDeck() {
      try {
        const response = await fetch(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        );
        const data = await response.json();
        setDeckId(data.deck_id); // Store the deck ID to use in future API requests
      } catch (error) {
        console.error('Error fetching deck...', error);
      }
    }

    fetchDeck();
  }, []); // The empty dependency array ensures this runs only once when the component mounts

  // Draws a single card from the API
  async function drawCard() {
    try {
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
      );
      const data = await response.json();

      if (data.remaining === 0) {
        alert('Error: No cards remaining!');
        stopAutoDraw(); // Ensures auto-draw stops when the deck runs out
        return;
      }

      setCard(data.cards[0]); // Update state with the new card
    } catch (error) {
      console.error('Error drawing a card...', error);
    }
  }

  // Shuffles the existing deck and resets the drawn card
  async function shuffleDeck() {
    try {
      setIsShuffling(true); // Disables buttons while shuffling
      stopAutoDraw(); // Auto-drawing should stop when shuffling

      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`
      );
      await response.json();

      setCard(null); // Clear the currently displayed card since the deck order changes
    } catch (error) {
      console.error('Error shuffling deck...', error);
    } finally {
      setIsShuffling(false); // Re-enable buttons after shuffling
    }
  }

  // Starts auto-drawing a new card every second
  function startAutoDraw() {
    if (!drawInterval.current) {
      // Prevent multiple intervals from being set
      setIsAutoDrawing(true);

      drawInterval.current = setInterval(async () => {
        try {
          const response = await fetch(
            `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
          );
          const data = await response.json();

          if (data.remaining === 0) {
            alert('Error: No cards remaining!');
            stopAutoDraw(); // Stops auto-draw when the deck is empty
            return;
          }

          setCard(data.cards[0]); // Update state with the new card
        } catch (error) {
          console.error('Error drawing a card...', error);
        }
      }, 1000); // Runs every second
    }
  }

  // Stops auto-drawing by clearing the interval
  function stopAutoDraw() {
    if (drawInterval.current) {
      clearInterval(drawInterval.current); // Clears the interval so it stops running
      drawInterval.current = null; // Resets the ref to indicate no interval is active
      setIsAutoDrawing(false); // Updates UI so the button text changes
    }
  }

  return (
    <div>
      <h1>Card Drawing App</h1>
      {deckId ? <p>Deck ID: {deckId}</p> : <p>Loading deck...</p>}

      <button
        onClick={drawCard}
        disabled={!deckId || isShuffling || isAutoDrawing}
      >
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
