import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const chapter = searchParams.get('chapter') || '';
    const ca = searchParams.get('ca') || '';
    const dutiable = searchParams.get('dutiable') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let results: any = {
      hsCodes: [],
      productCodes: [],
      total: 0,
      page,
      limit,
    };

    if (type === 'all' || type === 'hs') {
      const where: any = {};
      
      if (query) {
        where.OR = [
          { hsCode: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }
      
      if (chapter) {
        where.chapter = chapter;
      }
      
      if (dutiable === 'true') {
        where.isDutiable = true;
      } else if (dutiable === 'false') {
        where.isDutiable = false;
      }
      
      if (ca) {
        where.hsCaControls = {
          some: {
            caCode: { contains: ca, mode: 'insensitive' },
          },
        };
      }

      const [hsCodes, hsTotal] = await Promise.all([
        prisma.hsCode.findMany({
          where,
          include: {
            hsCaControls: {
              include: {
                caRelation: true,
              },
            },
            hsProductMappings: {
              include: {
                productCodeRelation: true,
              },
              take: 5,
            },
          },
          skip,
          take: limit,
          orderBy: { hsCode: 'asc' },
        }),
        prisma.hsCode.count({ where }),
      ]);

      results.hsCodes = hsCodes;
      results.total += hsTotal;
    }

    if (type === 'all' || type === 'product') {
      const where: any = {};
      
      if (query) {
        where.OR = [
          { productCode: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }
      
      // Filter by chapter through related HS codes
      if (chapter) {
        where.hsProductMappings = {
          some: {
            hsCodeRelation: {
              chapter: chapter
            }
          }
        };
      }
      
      if (ca) {
        where.productCaControls = {
          some: {
            caCode: { contains: ca, mode: 'insensitive' },
          },
        };
      }

      const [productCodes, productTotal] = await Promise.all([
        prisma.productCode.findMany({
          where,
          include: {
            productCaControls: {
              include: {
                caRelation: true,
              },
            },
            hsProductMappings: {
              include: {
                hsCodeRelation: true,
              },
              take: 5,
            },
          },
          skip,
          take: limit,
          orderBy: { productCode: 'asc' },
        }),
        prisma.productCode.count({ where }),
      ]);

      results.productCodes = productCodes;
      results.total += productTotal;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
