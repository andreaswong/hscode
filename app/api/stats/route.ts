import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalHsCodes,
      totalProductCodes,
      totalCAs,
      dutiableCount,
      totalMappings,
    ] = await Promise.all([
      prisma.hsCode.count(),
      prisma.productCode.count(),
      prisma.competentAuthority.count(),
      prisma.hsCode.count({ where: { isDutiable: true } }),
      prisma.hsProductMapping.count(),
    ]);

    return NextResponse.json({
      totalHsCodes,
      totalProductCodes,
      totalCAs,
      dutiableCount,
      nonDutiableCount: totalHsCodes - dutiableCount,
      totalMappings,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
