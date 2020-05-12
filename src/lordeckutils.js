export function fetchLorDeck(code) {
  const fetchURL = `/api/decodeLor?deckstring=${code}`;
  return fetch(fetchURL)
    .then(res => res.json())
    .then((deck) => {
        if (deck === "Invalid Deckstring") {
          return "";
        } else {
          return deck;
        }
      },
      (error) => {
        return "";
      }
    )
}
