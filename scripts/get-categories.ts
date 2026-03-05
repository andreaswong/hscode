import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getCategories() {
  const hsCategories = await prisma.hsCode.findMany({
    where: {
      category: { not: null }
    },
    select: {
      category: true
    },
    distinct: ['category'],
    orderBy: {
      category: 'asc'
    }
  });

  const productCategories = await prisma.productCode.findMany({
    where: {
      category: { not: null }
    },
    select: {
      category: true
    },
    distinct: ['category'],
    orderBy: {
      category: 'asc'
    }
  });

  console.log('\n=== HS Code Categories ===');
  console.log(`Total unique categories: ${hsCategories.length}\n`);
  hsCategories.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.category}`);
  });

  console.log('\n=== Product Code Categories ===');
  console.log(`Total unique categories: ${productCategories.length}\n`);
  productCategories.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.category}`);
  });

  const allCategories = new Set([
    ...hsCategories.map(c => c.category),
    ...productCategories.map(c => c.category)
  ]);

  console.log('\n=== All Unique Categories (Combined) ===');
  console.log(`Total: ${allCategories.size}\n`);
  Array.from(allCategories).sort().forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

getCategories();
