## Playwright TypeScript Test Automation Framework

A modular, scalable E2E and API testing framework built with Playwright + TypeScript. Follows SOLID/DRY, supports REST/GraphQL, PostgreSQL/MongoDB utilities, env-driven config, fixtures-based DI, session reuse, and CI-friendly reporting (HTML/JSON + Slack).

### Features
- TypeScript + Playwright with parallelism, retries, robust timeouts
- Test types via tags: smoke, functional, regression
- REST and GraphQL API testing utilities
- PostgreSQL and MongoDB helpers (seed/verify/cleanup)
- Env and secrets from `.env` + `config/*.json`
- Path aliases with `@/*` for clean imports
- Fixtures for injecting utilities and page objects
- Storage state per env for session reuse
- HTML/JSON reports and optional Slack summary
- GitHub Actions workflow

### Project Structure
```
.
├── config/                   # Env configs (dev/staging/prod)
├── data/
│   ├── csv/                  # CSV test data
│   └── json/                 # JSON test data
├── reports/                  # JSON report output
├── src/
│   ├── api/
│   │   ├── graphqlClient.ts  # GraphQL client
│   │   └── restClient.ts     # REST client
│   ├── db/
│   │   ├── mongoClient.ts    # MongoDB helpers
│   │   └── postgresClient.ts # PostgreSQL helpers
│   ├── fixtures/
│   │   ├── page-fixtures.ts  # Page objects fixture
│   │   └── test-fixtures.ts  # Utilities fixture (API/DB/faker)
│   ├── pages/
│   │   ├── BasePage.ts
│   │   └── HomePage.ts
│   ├── reporters/
│   │   └── slack-reporter.ts # Slack summary reporter
│   ├── setup/
│   │   └── global-setup.ts   # Create storage state per env
│   └── utils/
│       ├── dataLoader.ts     # JSON/CSV loader
│       ├── env.ts            # Env + config loader
│       └── logger.ts         # Pino logger
├── tests/
│   ├── functional/
│   │   ├── graphql.spec.ts
│   │   └── rest.spec.ts
│   ├── regression/
│   │   └── sample.spec.ts
│   └── smoke/
│       └── example.spec.ts
├── .github/workflows/playwright.yml
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

### Requirements
- Node.js 18+ (recommended 20)
- Playwright browsers (`npx playwright install`)

### Setup
```bash
npm ci
npx playwright install --with-deps
cp .env.example .env   # optional; fill values
```

### Configuration & Environments
- Select environment with `ENV` (default `dev`).
- Base configs: `config/dev.json`, `config/staging.json`, `config/prod.json`.
- `.env` can override values (e.g., `BASE_URL`, `API_URL`, `GRAPHQL_URL`, DB URIs, Slack webhook).

Resolution order:
1) `.env` variables
2) `config/<ENV>.json`

### Running Tests
Scripts:
```bash
# All tests (ENV=dev)
npm test

# By tag
npm run test:smoke
npm run test:functional
npm run test:regression

# By specific tag
npm run test -- --grep @smoke
npm run test -- --grep @rest
npm run test -- --grep @graphql
npm run test -- --grep @db


# Different env
ENV=staging npm test
ENV=prod npm test

# Show HTML report
npm run report
```
More filters:
```bash
# Title match
npx playwright test -g login
# Single file
npx playwright test tests/functional/rest.spec.ts
```

### Fixtures & Dependency Injection
- Utilities fixture: `src/fixtures/test-fixtures.ts` injects `rest`, `graphql`, `pg`, `mongo`, `fake`.
- Page objects fixture: `src/fixtures/page-fixtures.ts` injects `homePage`.

Example:
```ts
import { test, expect } from "@/fixtures/page-fixtures";

test("@smoke homepage loads", async ({ homePage }) => {
  await homePage.goto();
  expect(await homePage.title()).toContain("Playwright");
});
```

### Page Objects
- Base in `src/pages/BasePage.ts`.
- One class per page with clear actions/assertions.

```ts
export class HomePage extends BasePage {
  async goto() { await this.page.goto("/"); }
  async title() { return this.page.title(); }
}
```

### API Testing
- REST: `src/api/restClient.ts`
- GraphQL: `src/api/graphqlClient.ts`

The framework provides powerful fixtures for API testing. You can easily make requests and validate responses against a defined contract using TypeScript types.

**REST API Example**

```ts
import { test, expect } from "@/fixtures/test-fixtures";
import {
  CreateObjectRequest,
  CreatedObjectResponse,
  ObjectByIdResponse,
  UpdatedObjectResponse
} from "@/api/types/objects";
import { faker } from "@faker-js/faker";

// Reusable function to generate test data
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

test("@functional @rest REST POST creates object and GET by id returns same data", async ({ rest }) => {
  const payload = generateRandomObjectPayload();

  // POST request
  const postRes = await rest.post("/objects", payload);
  expect(postRes.status()).toBe(200);
  const created: CreatedObjectResponse = await postRes.json();

  // Validate contract and data
  expect(created.name).toBe(payload.name);
  expect(created.data).toEqual(payload.data);

  // GET by ID
  const getRes = await rest.get(`/objects/${created.id}`);
  expect(getRes.ok()).toBeTruthy();
  const byId: ObjectByIdResponse = await getRes.json();

  // Validate contract and data
  expect(byId.id).toBe(created.id);
  expect(byId.name).toBe(payload.name);
});
```

**GraphQL API Example**

```ts
import { test, expect } from "@/fixtures/test-fixtures";
import { COUNTRIES_QUERY } from "@/api/graphql/countriesAPI";

test("@functional @graphql GraphQL query returns data", async ({ graphql }) => {
  const data = await graphql.query<{ countries: { code: string; name: string }[] }>(COUNTRIES_QUERY);
  expect(data.countries.length).toBeGreaterThan(0);
});
```

### Database Utilities
- PostgreSQL: `src/db/postgresClient.ts`
- MongoDB: `src/db/mongoClient.ts`

You can interact with your database to set up preconditions or assert outcomes. The framework supports using types to ensure your queries return the expected data structure.

**PostgreSQL Example**

```ts
import { test, expect } from "@/fixtures/test-fixtures";
import { Card } from "@/db/types/card";

test("@db postgres SELECT cards belonging to 'Spanish Vocabulary' deck", async ({ pg }) => {
  const query = `
    SELECT c.* 
    FROM cards c 
    JOIN decks d ON c."deckId" = d.id 
    WHERE d.name = 'Spanish Vocabulary'
  `;

  const result = await pg.query(query);
  const cards: Card[] = result.rows;

  expect(cards.length).toBeGreaterThan(0);
  for (const card of cards) {
    expect(card.deckId).toBeDefined();
  }
});
```

### MongoDB Example
```ts
import { test } from "@/fixtures/test-fixtures";

test("verify doc", async ({ mongo }) => {
  const count = await mongo.collection("users").countDocuments({ role: "admin" });
  expect(count).toBeGreaterThan(0);
});
```

### Test Data Management
- Place JSON in `data/json` and CSV in `data/csv`.
- Use `src/utils/dataLoader.ts` to load test data.

### Authentication & Session
- `src/setup/global-setup.ts` creates `storage_states/<env>.json` on first run.
- Customize login steps if your app needs UI login.
- For API auth, set credentials in `.env` and/or `config/<env>.json` and implement in setup.

### Reporting
- Reporters: `list`, `html` (to `playwright-report`), `json` (to `reports/report.json`).
- Slack summary: set `SLACK_WEBHOOK_URL` to enable `src/reporters/slack-reporter.ts`.

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..." npm test
```

### CI/CD
- GitHub Actions workflow in `.github/workflows/playwright.yml`.
- Installs deps and browsers, runs tests with `ENV=dev`, uploads HTML report.
- Optional Slack webhook via repository secret `SLACK_WEBHOOK_URL`.

### Extending the Framework
- Add new pages under `src/pages` and wire them in `page-fixtures`.
- Add new utilities and expose via `src/fixtures/test-fixtures.ts`.
- Create new env configs in `config/<env>.json` and select with `ENV=<env>`.
- Add reporters in `playwright.config.ts`.

### Troubleshooting
- "await has no effect": Use plain `expect(...)` for sync assertions; use `await expect(locator)...` for locator assertions.
- Slack reporter typings: Counts computed from lifecycle events; no `result.stats` dependency.
- Storage state: ensure `storage_states/<env>.json` exists; delete to regenerate.
- Timeouts: tune `timeout`, `actionTimeout`, `navigationTimeout` in `playwright.config.ts`.

---
Happy testing!
