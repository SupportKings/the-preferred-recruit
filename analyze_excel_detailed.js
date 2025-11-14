const XLSX = require('xlsx');
const wb = XLSX.readFile('/Users/vugarnasraddinli/Desktop/OpsKings Projects/the-preferred-recruit/Men\'s Track and Field Database July 2025.xlsx');

console.log('=== SHEET NAMES ===');
wb.SheetNames.forEach(n => console.log('  ' + n));

const sheetsToAnalyze = wb.SheetNames.slice(0, 3);

sheetsToAnalyze.forEach((sheetName) => {
  console.log('\n========== SHEET: ' + sheetName + ' ==========');
  const ws = wb.Sheets[sheetName];
  
  if (!ws) {
    console.log('No worksheet found');
    return;
  }
  
  const range = XLSX.utils.decode_range(ws['!ref']);
  console.log('\nSheet Dimensions: ' + (range.e.r + 1) + ' rows x ' + (range.e.c + 1) + ' columns');
  
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log('Parsed Rows: ' + data.length);
  
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('\nColumn Names (' + columns.length + '):');
    columns.slice(0, 20).forEach((col, idx) => {
      console.log('  ' + (idx + 1) + '. "' + col + '"');
    });
    if (columns.length > 20) {
      console.log('  ... and ' + (columns.length - 20) + ' more columns');
    }
    
    console.log('\nFirst sample row:');
    const row = data[0];
    columns.slice(0, 10).forEach((col) => {
      const val = row[col];
      console.log('  ' + col + ': ' + (val || '(empty)'));
    });
  }
});
