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

async function updateCANames() {
  const filePath = path.join(DATA_DIR, 'AllCAContactInformation20260306020338.xls');
  console.log(`Reading file: ${filePath}\n`);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];
  
  console.log(`Found ${data.length} rows\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const row of data) {
    const caCode = row['CA Code'];
    const caName = row['Competent Authority'];
    
    if (!caCode || !caName) continue;
    
    try {
      const result = await prisma.competentAuthority.update({
        where: { caCode: caCode.toString().trim() },
        data: { caName: caName.toString().trim() }
      });
      
      console.log(`✓ Updated ${caCode}: ${caName.substring(0, 60)}...`);
      updated++;
    } catch (error) {
      console.log(`✗ CA Code not found in database: ${caCode}`);
      notFound++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found: ${notFound}`);
  
  await prisma.$disconnect();
  await pool.end();
}

updateCANames();
