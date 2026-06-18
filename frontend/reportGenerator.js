const fs = require('fs');
const path = require('path');

let results = [];

function init() {
  results = [];
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function addResult(testName, passed, error = null) {
  results.push({
    name: testName,
    status: passed ? 'Pass' : 'Fail',
    error: error || ''
  });
}

async function generateAndPrint() {
  const passedCount = results.filter(r => r.status === 'Pass').length;
  const failedCount = results.filter(r => r.status === 'Fail').length;
  
  log('--- Test Execution Summary ---');
  results.forEach(r => {
    log(`${r.name}: ${r.status} ${r.error ? `(${r.error})` : ''}`);
  });
  
  const reportPath = path.join(__dirname, 'candidate-e2e-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    details: results
  }, null, 2));
  
  log(`Report saved to ${reportPath}`);
  
  return {
    passed: passedCount,
    failed: failedCount
  };
}

module.exports = {
  init,
  log,
  addResult,
  generateAndPrint
};
