import { test, expect } from "@/fixtures/test-fixtures";

test("@functional REST GET works", async ({ rest }) => {
  const res = await rest.get("/get", { ping: 1 });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.args.ping).toBe("1");
});
