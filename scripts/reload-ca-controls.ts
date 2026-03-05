import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as path from 'path';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(process.cwd(), 'data');

function readXlsFile(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  console.log(`Reading file: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`  Found ${data.length} rows`);
    return data;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function loadCaControls() {
  console.log('\n=== Loading CA Controls ===');
  const data = readXlsFile('AllHSCAProductCode20260305235713.xls') as any[];
  
  let hsCaMappings = 0;
  let productCaMappings = 0;
  
  for (const row of data) {
    const hsCode = row['HS Code']?.toString();
    const productCode = row['CA Product Code'];
    const caCodeImport = row['Competent Authorities - Controlling by HS Code'];
    const caCodeExport = row['__EMPTY'];
    const caCodeTrans = row['__EMPTY_1'];
    
    const caCodes = [caCodeImport, caCodeExport, caCodeTrans].filter(ca => ca && ca !== 'Import' && ca !== 'Export' && ca !== 'Transhipment');
    
    for (const caCode of caCodes) {
      if (hsCode && caCode) {
        try {
          await prisma.hsCaControl.upsert({
            where: {
              hsCode_caCode: {
                hsCode,
                caCode,
              },
            },
            update: {},
            create: {
              hsCode,
              caCode,
            },
          });
          hsCaMappings++;
        } catch (error) {
          // Skip if HS code or CA doesn't exist
        }
      }
      
      if (productCode && caCode) {
        try {
          await prisma.productCaControl.upsert({
            where: {
              productCode_caCode: {
                productCode,
                caCode,
              },
            },
            update: {},
            create: {
              productCode,
              caCode,
            },
          });
          productCaMappings++;
        } catch (error) {
          // Skip if product code or CA doesn't exist
        }
      }
    }
    
    if ((hsCaMappings + productCaMappings) % 1000 === 0) {
      console.log(`  Processed ${hsCaMappings} HS-CA, ${productCaMappings} Product-CA controls...`);
    }
  }
  
  console.log(`Completed:`);
  console.log(`  - ${hsCaMappings} HS-CA controls`);
  console.log(`  - ${productCaMappings} Product-CA controls`);
}

async function main() {
  console.log('Reloading CA controls...\n');
  
  try {
    await loadCaControls();
    
    console.log('\n=== Summary ===');
    const hsCaCount = await prisma.hsCaControl.count();
    const productCaCount = await prisma.productCaControl.count();
    
    console.log(`Total HS-CA Controls: ${hsCaCount}`);
    console.log(`Total Product-CA Controls: ${productCaCount}`);
    
    console.log('\nCA controls reload completed successfully!');
  } catch (error) {
    console.error('Error during CA controls reload:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
