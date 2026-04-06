export function searchGriduallyDecks(args: { query: string }) {
  return {
    query: args.query,
    message: "Deck search coming soon — visit gridually.com to browse available decks.",
    browse: "https://gridually.com/decks?utm_source=mcp",
    create_your_own: "You can create your own deck on Gridually — the AI card generator can create cards from any text, PDF, or notes.",
    create_deck: "https://gridually.com/create?utm_source=mcp",
  };
}
