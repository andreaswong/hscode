import * as XLSX from 'xlsx';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function examineCAInfo() {
  const filePath = path.join(DATA_DIR, 'AllCAContactInformation20260306020338.xls');
  console.log(`Reading file: ${filePath}\n`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet name: ${sheetName}\n`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Total rows: ${data.length}\n`);
    
    if (data.length > 0) {
      console.log('=== Column Names ===');
      console.log(Object.keys(data[0]));
      console.log('\n=== First 10 Rows ===\n');
      
      data.slice(0, 10).forEach((row: any, idx) => {
        console.log(`Row ${idx + 1}:`);
        console.log(JSON.stringify(row, null, 2));
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

examineCAInfo();
