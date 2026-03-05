# Singapore Customs HS Code Webapp

A Next.js web application for querying Singapore Customs HS codes, product codes, and competent authority information.

## Features

- Search by HS Code or Product Code
- Filter by category of goods
- Filter by Competent Authority (CA)
- Filter by dutiability status
- View duty rates and CA requirements

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Data Source**: Singapore Customs XLS files

## Prerequisites

- Node.js 20+
- PostgreSQL 12+

## Database Setup

The database has already been created with the following credentials:
- Database: `hscode_db`
- User: `hscode_user`
- Password: `hscode_dev_password`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
The `.env` file should already contain:
```
DATABASE_URL="postgresql://hscode_user:hscode_dev_password@localhost:5432/hscode_db"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Generate Prisma client:
```bash
npx prisma generate
```

## Data Loading

### Examine XLS Files
To understand the structure of the XLS files:
```bash
npm run examine-data
```

### Load Data into Database
To populate the database with data from XLS files:
```bash
npm run load-data
```

This will load:
- HS Codes (~11,000 records)
- Product Codes (~16,000 records)
- Competent Authorities
- HS-Product mappings
- HS-CA controls
- Product-CA controls
- Product pairs

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses a normalized relational schema with the following main tables:

- `hs_codes` - HS code master data
- `product_codes` - Product code master data
- `competent_authorities` - CA information
- `hs_product_mapping` - HS to Product relationships
- `hs_ca_control` - HS codes controlled by CAs
- `product_ca_control` - Product codes controlled by CAs
- `product_pairs` - Related product code pairs
- `categories` - Hierarchical category structure

## API Endpoints (To Be Implemented)

- `GET /api/hs-codes` - Search HS codes
- `GET /api/hs-codes/[code]` - Get specific HS code details
- `GET /api/product-codes` - Search product codes
- `GET /api/product-codes/[code]` - Get specific product code details
- `GET /api/competent-authorities` - List all CAs
- `GET /api/search` - Combined search endpoint

## Project Structure

```
hscode-webapp/
├── app/                    # Next.js app directory
├── lib/                    # Utility libraries
│   └── prisma.ts          # Prisma client singleton
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
├── scripts/               # Data loading scripts
│   ├── examine-data.ts    # XLS file examination
│   └── load-data.ts       # Data import script
├── data/                  # XLS source files
└── public/                # Static assets
```

## License

MIT
