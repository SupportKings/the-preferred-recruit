const XLSX = require('xlsx');
const wb = XLSX.readFile('/Users/vugarnasraddinli/Desktop/OpsKings Projects/the-preferred-recruit/Men\'s Track and Field Database July 2025.xlsx');

const ws = wb.Sheets['DI'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('=== DI Sheet Column Headers (Row 6) ===\n');

const headers = [];
for (let col = 0; col <= 40; col++) {
  const cellRef = XLSX.utils.encode_col(col) + '6';
  const cell = ws[cellRef];
  const value = cell ? cell.v : null;
  headers.push(value);
  if (value) {
    console.log('Col ' + (col + 1) + ' (' + XLSX.utils.encode_col(col) + '): "' + value + '"');
  }
}

console.log('\n\n=== Sample Data Rows (Rows 7-10) ===\n');

for (let row = 7; row <= 10; row++) {
  console.log('--- Row ' + row + ' ---');
  for (let col = 0; col <= 20; col++) {
    const cellRef = XLSX.utils.encode_col(col) + row;
    const cell = ws[cellRef];
    const value = cell ? cell.v : null;
    const header = headers[col] || '(no header)';
    console.log(XLSX.utils.encode_col(col) + ': [' + header + '] = ' + (value || '(empty)'));
  }
  console.log('');
}
