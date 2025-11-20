const XLSX = require('xlsx');
const wb = XLSX.readFile('/Users/vugarnasraddinli/Desktop/OpsKings Projects/the-preferred-recruit/Men\'s Track and Field Database July 2025.xlsx');

console.log('=== SHEET NAMES ===');
wb.SheetNames.forEach(n => console.log('  ' + n));

const sheetsToAnalyze = wb.SheetNames.slice(0, 3);

sheetsToAnalyze.forEach((sheetName) => {
  console.log('\n========== SHEET: ' + sheetName + ' ==========');
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);
  
  if (data.length === 0) {
    console.log('(Empty sheet)');
    return;
  }
  
  const columns = Object.keys(data[0]);
  console.log('\nTotal Rows: ' + data.length);
  console.log('\nColumn Names (' + columns.length + '):');
  columns.forEach((col, idx) => {
    console.log('  ' + (idx + 1) + '. "' + col + '"');
  });
  
  console.log('\nFirst 2 Sample Rows:');
  data.slice(0, 2).forEach((row, idx) => {
    console.log('\n--- Row ' + (idx + 1) + ' ---');
    columns.forEach((col) => {
      const val = row[col];
      console.log('  ' + col + ': ' + (val !== undefined && val !== null ? val : '(empty)'));
    });
  });
});
