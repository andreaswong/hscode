import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkSamples() {
  console.log('\n=== Sample HS Codes ===');
  const hsCodes = await prisma.hsCode.findMany({
    take: 5,
    orderBy: { hsCode: 'asc' }
  });
  
  hsCodes.forEach(hs => {
    console.log(`\nHS Code: ${hs.hsCode}`);
    console.log(`Description: ${hs.description}`);
    console.log(`Category: ${hs.category || '(null)'}`);
    console.log(`Chapter: ${hs.chapter || '(null)'}`);
    console.log(`Heading: ${hs.heading || '(null)'}`);
    console.log(`Subheading: ${hs.subheading || '(null)'}`);
    console.log(`Dutiable: ${hs.isDutiable}`);
  });

  console.log('\n=== Sample Product Codes ===');
  const productCodes = await prisma.productCode.findMany({
    take: 5,
    orderBy: { productCode: 'asc' }
  });
  
  productCodes.forEach(pc => {
    console.log(`\nProduct Code: ${pc.productCode}`);
    console.log(`Description: ${pc.description}`);
    console.log(`Category: ${pc.category || '(null)'}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

checkSamples();
