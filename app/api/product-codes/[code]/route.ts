import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const productCode = await prisma.productCode.findUnique({
      where: { productCode: code },
      include: {
        productCaControls: {
          include: {
            caRelation: true,
          },
        },
        hsProductMappings: {
          include: {
            hsCodeRelation: {
              include: {
                hsCaControls: {
                  include: {
                    caRelation: true,
                  },
                },
              },
            },
          },
        },
        productPairsAsCode1: {
          include: {
            productCode2Relation: true,
          },
        },
        productPairsAsCode2: {
          include: {
            productCode1Relation: true,
          },
        },
      },
    });

    if (!productCode) {
      return NextResponse.json(
        { error: 'Product Code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(productCode);
  } catch (error) {
    console.error('Error fetching product code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product code' },
      { status: 500 }
    );
  }
}
