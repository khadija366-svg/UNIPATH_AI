// Mirrors backend/app/data/tests.json — keep in sync with the authoritative backend config.
export const TEST_DEFINITIONS = {
  ECAT: { name: 'ECAT', total: 400, minimumScore: null },
  NAT: { name: 'NAT', total: 100, minimumScore: 50 },
  MCAT: { name: 'MCAT', total: 200, minimumScore: null },
  SAT: { name: 'SAT', total: 1600, minimumScore: null },
  NTS: { name: 'NTS', total: 100, minimumScore: 50 },
  'FAST-NU Test': { name: 'FAST-NU Test', total: 100, minimumScore: 50 },
  'PU Test': { name: 'PU Test', total: 100, minimumScore: 50 },
  'LUMS Test': { name: 'LUMS Test', total: 100, minimumScore: null },
  'University Test': { name: 'University Test', total: 100, minimumScore: null },
}

export const TEST_OPTIONS = Object.keys(TEST_DEFINITIONS)

export function getTestTotal(name) {
  return TEST_DEFINITIONS[name]?.total ?? null
}

export function isKnownTest(name) {
  return name in TEST_DEFINITIONS
}
