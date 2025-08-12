import { test, expect } from "@playwright/test";

test("@regression math works", async () => {
  expect(2 + 2).toBe(4);
});
