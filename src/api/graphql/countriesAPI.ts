// Reusable GraphQL queries for countries and continents

export const COUNTRIES_QUERY = `
  query Countries {
    countries {
      code
      name
      
    }
  }
`;

export const CONTINENT_QUERY = `
  query GetContinent($code: ID!) {
    continent(code: $code) {
      code
      name
      countries {
        code
        name
      }
    }
  }
`;
