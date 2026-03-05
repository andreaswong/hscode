import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkCANames() {
  const cas = await prisma.competentAuthority.findMany({
    where: {
      caCode: { not: '-' }
    },
    orderBy: { caCode: 'asc' },
    take: 30
  });

  console.log('\n=== CA Codes and Names ===\n');
  cas.forEach((ca) => {
    const cleanCode = ca.caCode.replace(/\n/g, ' ');
    console.log(`Code: "${cleanCode}"`);
    console.log(`Name: "${ca.caName}"`);
    console.log('---');
  });

  await prisma.$disconnect();
  await pool.end();
}

checkCANames();
