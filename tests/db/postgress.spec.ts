import { test, expect } from "@/fixtures/test-fixtures";


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
    expect(result.rows).toBeDefined();
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
    // Optionally, validate that all returned cards have the correct deckId
    for (const card of result.rows) {
      expect(card.deckId).toBeDefined();
    }
    console.log(result.rows);
  } catch (error) {
    console.error("Error querying cards for 'Spanish Vocabulary' deck:", error);
    throw error;
  }
});
