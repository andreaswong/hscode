# Filtering Guide

## Available Filters

The Singapore Customs HS Code Search webapp provides the following filtering options:

### 1. Search Type
- **All**: Search both HS codes and product codes
- **HS Codes Only**: Search only HS codes
- **Product Codes Only**: Search only product codes

### 2. HS Chapter (Dropdown)
Filter HS codes by their chapter (01-99). Each chapter represents a major commodity group:

**Examples:**
- **Chapter 01**: Live Animals
- **Chapter 02**: Meat
- **Chapter 03**: Fish
- **Chapter 84**: Machinery
- **Chapter 85**: Electrical Machinery
- **Chapter 87**: Vehicles

The dropdown shows all available chapters with their descriptions for easy browsing.

### 3. Competent Authority (Dropdown)
Filter by the government agency that controls/regulates specific codes:

**Examples:**
- AVA (Agri-Food & Veterinary Authority)
- HSA (Health Sciences Authority)
- NEA (National Environment Agency)
- And 76 more authorities

### 4. Dutiability (Dropdown)
Filter by whether duty/tax is applicable:
- **All**: Show both dutiable and non-dutiable codes
- **Dutiable Only**: Show only codes subject to import duty
- **Non-Dutiable Only**: Show only codes exempt from duty

## Why Chapter Dropdown Instead of Category?

The original XLS data files **do not contain category information**. Instead, they contain:
- **Chapter**: 2-digit code (01-99) representing major commodity groups
- **Heading**: 4-digit code for subcategories
- **Subheading**: 6-digit code for detailed classifications

Using a **dropdown for chapters** provides:
1. ✅ **Better UX** - Users can browse all available options
2. ✅ **No typos** - Prevents invalid input
3. ✅ **Standardized** - HS chapters are internationally standardized
4. ✅ **Descriptive** - Each chapter has a clear name (e.g., "84 - Machinery")
5. ✅ **Limited options** - Only ~99 chapters, perfect for dropdown

## Search Capabilities

You can combine filters for powerful searches:

**Example 1**: Find all dutiable electrical machinery
- Search Type: HS Codes Only
- Chapter: 85 - Electrical Machinery
- Dutiability: Dutiable Only

**Example 2**: Find all products controlled by HSA
- Search Type: All
- Competent Authority: HSA

**Example 3**: Search for specific items
- Query: "laptop"
- Search Type: All
- (Searches both HS codes and product codes for "laptop")

## API Usage

The search API accepts the following parameters:

```
GET /api/search?q=query&type=all&chapter=84&ca=AVA&dutiable=true&page=1&limit=20
```

**Parameters:**
- `q`: Search query (HS code, product code, or description)
- `type`: all | hs | product
- `chapter`: 2-digit chapter code (01-99)
- `ca`: Competent authority code
- `dutiable`: true | false
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
