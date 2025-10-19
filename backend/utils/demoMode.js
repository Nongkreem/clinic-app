const MockDate = require("mockdate");

let demoEnabled = false;

function enableDemoMode(date = new Date()) {
  demoEnabled = true;
  MockDate.set(date);
  console.log(`Demo Mode enabled. Simulated date: ${date}`);
}

function disableDemoMode() {
  demoEnabled = false;
  MockDate.reset();
  console.log("Demo Mode disabled. Date reset to current system time.");
}

function isDemoMode() {
  return demoEnabled;
}

module.exports = { enableDemoMode, disableDemoMode, isDemoMode };
