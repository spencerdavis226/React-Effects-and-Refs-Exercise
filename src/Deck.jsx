import { useState, useEffect } from 'react';

const Deck = () => {
  const [deckId, setDeckId] = useState(null);

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

  return (
    <div>
      <h1>Card Drawing App</h1>
      {deckId ? <p>Deck ID: {deckId}</p> : <p>Loading deck...</p>}
      <button disabled={!deckId}>Draw a Card</button>
    </div>
  );
};

export default Deck;
