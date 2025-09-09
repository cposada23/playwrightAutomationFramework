import { test, expect } from "@/fixtures/test-fixtures";
import { Card } from "@/db/types/card";
import { Deck } from "@/db/types/deck";


test("@db postgres SELECT * FROM public.cards returns results", async ({ pg }) => {
  try {
    const result = await pg.query("SELECT * FROM public.cards");
    expect(result.rows).toBeDefined();
    expect(Array.isArray(result.rows)).toBe(true);
    console.log(result.rows)
    expect(result.rows.length).toBeGreaterThan(0);
  } catch (error) {
    console.error("Error querying public.cards:", error);
    throw error;
  }
});

test("@db postgres SELECT cards belonging to 'Spanish Vocabulary' deck", async ({ pg }) => {
  const query = `SELECT c.* FROM cards c JOIN decks d ON c."deckId" = d.id WHERE d.name = 'Spanish Vocabulary'`;
  try {
    const result = await pg.query(query);
    const cards: Card[] = result.rows as Card[];
    expect(cards).toBeDefined();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.deckId).toBeDefined();
    }
    console.log(cards);
  } catch (error) {
    console.error("Error querying cards for 'Spanish Vocabulary' deck:", error);
    throw error;
  }
});

test("@db postgres SELECT deck 'British History' and its cards", async ({ pg }) => {
  const query = `SELECT d.*, c.id AS card_id, c.front, c.back
    FROM decks d
    LEFT JOIN cards c ON d.id = c."deckId"
    WHERE d.name = 'British History'`;
  try {
    const result = await pg.query(query);
    expect(result.rows).toBeDefined();
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);

    // Build Deck object from result
    const deckRow = result.rows[0];
    const deck: Deck = {
      id: deckRow.id,
      name: deckRow.name,
      description: deckRow.description,
      userId: deckRow.userId,
      createdAt: deckRow.createdAt,
      updatedAt: deckRow.updatedAt,
      cards: result.rows
        .filter(row => row.card_id !== null)
        .map(row => ({
          id: row.card_id,
          deckId: deckRow.id,
          front: row.front,
          back: row.back, // Note: 'cack' in Card type, but query returns 'back'
          createdAt: '', // Not selected in query
          updatedAt: ''  // Not selected in query
        }))
    };

    expect(deck.name).toBe('British History');
    expect(deck.cards).toBeDefined();
    expect(Array.isArray(deck.cards)).toBe(true);
    // Optionally assert at least one card
    if (deck.cards.length > 0) {
      for (const card of deck.cards) {
        expect(card.front).toBeDefined();
        expect(card.back).toBeDefined();
      }
    }
    console.log(deck);
  } catch (error) {
    console.error("Error querying deck 'British History' and its cards:", error);
    throw error;
  }
});
