import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkHyphenCA() {
  // Check for HS code 15011000
  const hsCode = await prisma.hsCode.findUnique({
    where: { hsCode: '15011000' },
    include: {
      hsCaControls: {
        include: {
          caRelation: true,
        },
      },
    },
  });

  console.log('\n=== HS Code 15011000 ===');
  console.log('Description:', hsCode?.description);
  console.log('CA Controls:', hsCode?.hsCaControls.length);
  
  if (hsCode?.hsCaControls) {
    hsCode.hsCaControls.forEach((control, idx) => {
      console.log(`\n${idx + 1}. CA Code: "${control.caRelation.caCode}"`);
      console.log(`   CA Name: "${control.caRelation.caName}"`);
    });
  }

  // Check for CAs with hyphen
  const hyphenCAs = await prisma.competentAuthority.findMany({
    where: {
      OR: [
        { caCode: '-' },
        { caCode: { contains: '-' } },
      ]
    }
  });

  console.log('\n=== Competent Authorities with hyphen ===');
  console.log(`Found: ${hyphenCAs.length}`);
  hyphenCAs.forEach((ca) => {
    console.log(`\nCA Code: "${ca.caCode}"`);
    console.log(`CA Name: "${ca.caName}"`);
  });

  await prisma.$disconnect();
  await pool.end();
}

checkHyphenCA();
