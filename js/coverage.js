const percentage = {
  lines: 100,
  statements: 100,
  functions: 100,
  branches: 100
}
var some = require('./karma/coverage/coverage-summary.json');

for (let res in some.total) {
  if (some.total[res].pct < percentage[res]) {
    console.log(`Coverage too low, expected: ${percentage[res]}, got: ${some.total[res].pct}`);
    throw new Error(`Coverage too low, expected: ${percentage[res]}, got: ${some.total[res].pct}`);
  }
}