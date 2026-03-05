import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as path from 'path';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface HsCodeRow {
  hs_code?: string;
  description?: string;
  category?: string;
  chapter?: string;
  heading?: string;
  subheading?: string;
  is_dutiable?: boolean | string;
  duty_rate?: number | string;
}

interface ProductCodeRow {
  product_code?: string;
  description?: string;
  category?: string;
}

interface HsProductMappingRow {
  hs_code?: string;
  product_code?: string;
}

interface HsCaRow {
  hs_code?: string;
  product_code?: string;
  ca_code?: string;
  ca_name?: string;
  control_type?: string;
  requirements?: string;
}

interface ProductPairRow {
  product_code_1?: string;
  product_code_2?: string;
  relationship_type?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'y';
  }
  return false;
}

function parseNumber(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

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

async function loadHsCodes() {
  console.log('\n=== Loading HS Codes ===');
  const data = readXlsFile('AllHSCode20260305235722.xls') as any[];
  
  let inserted = 0;
  let skipped = 0;
  
  for (const row of data) {
    const hsCode = row['HS Code']?.toString();
    const description = row['HS Description'];
    
    if (!hsCode || !description) {
      skipped++;
      continue;
    }
    
    const chapter = hsCode.substring(0, 2);
    const heading = hsCode.substring(0, 4);
    const subheading = hsCode.substring(0, 6);
    
    try {
      await prisma.hsCode.upsert({
        where: { hsCode },
        update: {
          description,
          chapter,
          heading,
          subheading,
        },
        create: {
          hsCode,
          description,
          chapter,
          heading,
          subheading,
        },
      });
      inserted++;
      
      if (inserted % 1000 === 0) {
        console.log(`  Processed ${inserted} HS codes...`);
      }
    } catch (error) {
      console.error(`Error inserting HS code ${hsCode}:`, error);
    }
  }
  
  console.log(`Completed: ${inserted} inserted/updated, ${skipped} skipped`);
}

async function loadDutiableHsCodes() {
  console.log('\n=== Loading Dutiable HS Codes ===');
  const data = readXlsFile('AllDutiableHSCode20260305235720.xls') as any[];
  
  let updated = 0;
  let skipped = 0;
  
  for (const row of data) {
    const hsCode = row['HS Code']?.toString();
    if (!hsCode) {
      skipped++;
      continue;
    }
    
    const customsDuty = row['Customs Duty'];
    const exciseDuty = row['Excise Duty'];
    
    let dutyRate = null;
    if (customsDuty && customsDuty !== '-') {
      dutyRate = parseNumber(customsDuty);
    } else if (exciseDuty && exciseDuty !== '-') {
      dutyRate = parseNumber(exciseDuty);
    }
    
    try {
      await prisma.hsCode.update({
        where: { hsCode },
        data: {
          isDutiable: true,
          dutyRate,
        },
      });
      updated++;
    } catch (error) {
      skipped++;
    }
  }
  
  console.log(`Completed: ${updated} HS codes marked as dutiable, ${skipped} skipped`);
}

async function loadProductCodes() {
  console.log('\n=== Loading Product Codes ===');
  const data = readXlsFile('AllProductCode20260305235725.xls') as any[];
  
  let inserted = 0;
  let skipped = 0;
  
  for (const row of data) {
    const productCode = row['Product Code'];
    const description = row['Product Description'];
    
    if (!productCode || !description) {
      skipped++;
      continue;
    }
    
    try {
      await prisma.productCode.upsert({
        where: { productCode },
        update: {
          description,
        },
        create: {
          productCode,
          description,
        },
      });
      inserted++;
      
      if (inserted % 1000 === 0) {
        console.log(`  Processed ${inserted} product codes...`);
      }
    } catch (error) {
      console.error(`Error inserting product code ${productCode}:`, error);
    }
  }
  
  console.log(`Completed: ${inserted} inserted/updated, ${skipped} skipped`);
}

async function loadHsProductCaMappings() {
  console.log('\n=== Loading HS-Product-CA Mappings ===');
  const data = readXlsFile('AllHSCAProductCode20260305235713.xls') as any[];
  
  let hsProductMappings = 0;
  let hsCaMappings = 0;
  let productCaMappings = 0;
  const caMap = new Map<string, string>();
  
  for (const row of data) {
    const hsCode = row['HS Code']?.toString();
    const productCode = row['CA Product Code'];
    const caCodeImport = row['Competent Authorities - Controlling by HS Code'];
    const caCodeExport = row['__EMPTY'];
    const caCodeTrans = row['__EMPTY_1'];
    
    const caCodes = [caCodeImport, caCodeExport, caCodeTrans].filter(ca => ca && ca !== 'Import' && ca !== 'Export' && ca !== 'Transhipment');
    
    for (const caCode of caCodes) {
      if (caCode && !caMap.has(caCode)) {
        caMap.set(caCode, caCode);
      }
    }
    
    if (hsCode && productCode) {
      try {
        await prisma.hsProductMapping.upsert({
          where: {
            hsCode_productCode: {
              hsCode,
              productCode,
            },
          },
          update: {},
          create: {
            hsCode,
            productCode,
          },
        });
        hsProductMappings++;
      } catch (error) {
        // Skip if HS code or product code doesn't exist
      }
    }
    
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
    
    if ((hsProductMappings + hsCaMappings + productCaMappings) % 1000 === 0) {
      console.log(`  Processed ${hsProductMappings} HS-Product, ${hsCaMappings} HS-CA, ${productCaMappings} Product-CA mappings...`);
    }
  }
  
  for (const caCode of caMap.keys()) {
    try {
      await prisma.competentAuthority.upsert({
        where: { caCode },
        update: {},
        create: {
          caCode,
          caName: caCode,
        },
      });
    } catch (error) {
      console.error(`Error creating CA ${caCode}:`, error);
    }
  }
  
  console.log(`Completed:`);
  console.log(`  - ${caMap.size} Competent Authorities created`);
  console.log(`  - ${hsProductMappings} HS-Product mappings`);
  console.log(`  - ${hsCaMappings} HS-CA controls`);
  console.log(`  - ${productCaMappings} Product-CA controls`);
}

async function loadProductPairs() {
  console.log('\n=== Loading Product Pairs ===');
  const data = readXlsFile('AllProductPair20260305235710.xls') as any[];
  
  let inserted = 0;
  let skipped = 0;
  
  for (const row of data) {
    const productCode1 = row['CA Product Code 1'];
    const productCode2 = row['CA Product Code 2'];
    const ca1 = row['Competent Authorities 1'];
    const ca2 = row['Competent Authorities 2'];
    
    if (!productCode1 || !productCode2) {
      skipped++;
      continue;
    }
    
    const relationshipType = `${ca1 || ''}-${ca2 || ''}`;
    
    try {
      await prisma.productPair.create({
        data: {
          productCode1,
          productCode2,
          relationshipType: relationshipType || null,
        },
      });
      inserted++;
    } catch (error) {
      skipped++;
    }
  }
  
  console.log(`Completed: ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  console.log('Starting data load process...\n');
  console.log(`Data directory: ${DATA_DIR}\n`);
  
  try {
    await loadHsCodes();
    await loadProductCodes();
    await loadHsProductCaMappings();
    await loadDutiableHsCodes();
    await loadProductPairs();
    
    console.log('\n=== Data Load Summary ===');
    const hsCodeCount = await prisma.hsCode.count();
    const productCodeCount = await prisma.productCode.count();
    const caCount = await prisma.competentAuthority.count();
    const hsProductCount = await prisma.hsProductMapping.count();
    const hsCaCount = await prisma.hsCaControl.count();
    const productCaCount = await prisma.productCaControl.count();
    const productPairCount = await prisma.productPair.count();
    
    console.log(`Total HS Codes: ${hsCodeCount}`);
    console.log(`Total Product Codes: ${productCodeCount}`);
    console.log(`Total Competent Authorities: ${caCount}`);
    console.log(`Total HS-Product Mappings: ${hsProductCount}`);
    console.log(`Total HS-CA Controls: ${hsCaCount}`);
    console.log(`Total Product-CA Controls: ${productCaCount}`);
    console.log(`Total Product Pairs: ${productPairCount}`);
    
    console.log('\nData load completed successfully!');
  } catch (error) {
    console.error('Error during data load:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
