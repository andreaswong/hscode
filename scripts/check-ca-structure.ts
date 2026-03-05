import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkCAStructure() {
  const cas = await prisma.competentAuthority.findMany({
    orderBy: { caCode: 'asc' },
    take: 20
  });

  console.log('\n=== Sample CA Codes ===\n');
  cas.forEach((ca) => {
    const hasSpace = ca.caCode.includes(' ');
    const wordCount = ca.caCode.split(' ').length;
    console.log(`"${ca.caCode}" | Has space: ${hasSpace} | Words: ${wordCount}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

checkCAStructure();
