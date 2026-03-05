import * as XLSX from 'xlsx';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const files = [
  'AllDutiableHSCode20260305235720.xls',
  'AllHSCAProductCode20260305235713.xls',
  'AllHSCode20260305235722.xls',
  'AllProductCode20260305235725.xls',
  'AllProductPair20260305235710.xls'
];

function examineFile(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`FILE: ${filename}`);
  console.log('='.repeat(80));
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`\nSheet Name: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`\nTotal Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`\nColumns: ${Object.keys(data[0]).join(', ')}`);
      
      console.log(`\nFirst 3 rows (sample):`);
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`\nRow ${idx + 1}:`);
        console.log(JSON.stringify(row, null, 2));
      });
      
      console.log(`\nColumn Analysis:`);
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const sampleValues = data.slice(0, 10).map((row: any) => row[col]).filter(v => v !== undefined && v !== null && v !== '');
        const uniqueCount = new Set(sampleValues).size;
        console.log(`  - ${col}: ${uniqueCount} unique values in first 10 rows, sample: ${sampleValues[0]}`);
      });
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
}

console.log('Examining XLS files...');
console.log(`Data directory: ${DATA_DIR}\n`);

files.forEach(file => examineFile(file));

console.log('\n' + '='.repeat(80));
console.log('Examination complete!');
console.log('='.repeat(80));
