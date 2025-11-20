const XLSX = require('xlsx');
const wb = XLSX.readFile('/Users/vugarnasraddinli/Desktop/OpsKings Projects/the-preferred-recruit/Men\'s Track and Field Database July 2025.xlsx');

const ws = wb.Sheets['DI'];
const range = XLSX.utils.decode_range(ws['!ref']);

console.log('=== DI Sheet Raw Cells (first 10 rows) ===\n');

for (let row = 0; row < 10; row++) {
  console.log('Row ' + (row + 1) + ':');
  for (let col = 0; col < 10; col++) {
    const cellRef = XLSX.utils.encode_col(col) + (row + 1);
    const cell = ws[cellRef];
    const value = cell ? cell.v : null;
    console.log('  Col ' + (col + 1) + ' (' + cellRef + '): ' + (value || '(empty)'));
  }
  console.log('');
}
