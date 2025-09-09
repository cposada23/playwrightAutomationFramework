import { test, expect } from "@/fixtures/test-fixtures";
import {
  CreateObjectRequest,
  CreatedObjectResponse,
  ObjectByIdResponse,
  UpdatedObjectResponse,
  DeletedObjectResponse
} from "@/api/types/objects";
import { faker } from "@faker-js/faker";

function generateRandomObjectPayload(): CreateObjectRequest {
  return {
    name: faker.commerce.productName(),
    data: {
      year: faker.number.int({ min: 2015, max: 2025 }),
      price: parseFloat(faker.commerce.price({ min: 199, max: 3999, dec: 2 })),
      "CPU model": `${faker.word.noun()} ${faker.commerce.productAdjective()} ${faker.number.int({ min: 1, max: 99 })}`,
      "Hard disk size": `${faker.number.int({ min: 128, max: 4096 })} GB`
    }
  };
}

test("@functional @rest REST GET works", async ({ rest }) => {
  const res = await rest.get("/objects");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  console.log(json);
});

test("@functional @rest REST POST creates object and GET by id returns same data", async ({ rest }) => {
  const payload = generateRandomObjectPayload();

  console.log(payload);
  const postRes = await rest.post("/objects", payload);
  expect(postRes.status()).toBe(200);
  const created: CreatedObjectResponse = await postRes.json();

  expect(created.name).toBe(payload.name);
  expect(created.data).toEqual(payload.data);
  expect(typeof created.id).toBe("string");
  expect(created.id.length).toBeGreaterThan(0);
  expect(new Date(created.createdAt).toString()).not.toBe("Invalid Date");

  const getRes = await rest.get(`/objects/${created.id}`);
  expect(getRes.ok()).toBeTruthy();
  const byId: ObjectByIdResponse = await getRes.json();

  expect(byId.id).toBe(created.id);
  expect(byId.name).toBe(payload.name);
  expect(byId.data).toEqual(payload.data);
});

test("@functional @rest REST PATCH updates object name", async ({ rest, fake }) => {
  const createPayload = generateRandomObjectPayload();
  const createRes = await rest.post("/objects", createPayload);
  expect(createRes.status()).toBe(200);
  const created: CreatedObjectResponse = await createRes.json();

  const newName = fake.commerce.productName();
  const patchPayload = { name: newName };

  const patchRes = await rest.patch(`/objects/${created.id}`, patchPayload);
  expect(patchRes.status()).toBe(200);
  const updated: UpdatedObjectResponse = await patchRes.json();

  expect(updated.id).toBe(created.id);
  expect(updated.name).toBe(newName);
  expect(updated.data).toEqual(created.data); // Data should not change
  expect(new Date(updated.updatedAt).toString()).not.toBe("Invalid Date");
});


test("@functional @rest REST DELETE deletes object", async ({ rest }) => {
  const createPayload = generateRandomObjectPayload();
  const createRes = await rest.post("/objects", createPayload);
  expect(createRes.status()).toBe(200);
  const created: CreatedObjectResponse = await createRes.json();

  const deleteRes = await rest.delete(`/objects/${created.id}`);
  expect(deleteRes.status()).toBe(200);
  const deleted: DeletedObjectResponse = await deleteRes.json();
  expect(deleted.message).toBe(`Object with id = ${created.id} has been deleted.`);
});
