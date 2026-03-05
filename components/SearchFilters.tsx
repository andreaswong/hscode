'use client';

import { useEffect, useState } from 'react';

interface SearchFiltersProps {
  filters: {
    type: string;
    chapter: string;
    ca: string;
    dutiable: string;
  };
  setFilters: (filters: any) => void;
}

const CHAPTER_NAMES: Record<string, string> = {
  '01': 'Live Animals',
  '02': 'Meat',
  '03': 'Fish',
  '04': 'Dairy, Eggs, Honey',
  '05': 'Animal Products',
  '06': 'Live Trees & Plants',
  '07': 'Vegetables',
  '08': 'Fruit & Nuts',
  '09': 'Coffee, Tea, Spices',
  '10': 'Cereals',
  '11': 'Milling Products',
  '12': 'Oil Seeds',
  '13': 'Lac, Gums, Resins',
  '14': 'Vegetable Plaiting Materials',
  '15': 'Animal/Vegetable Fats & Oils',
  '16': 'Meat/Fish Preparations',
  '17': 'Sugars',
  '18': 'Cocoa',
  '19': 'Cereal Preparations',
  '20': 'Vegetable/Fruit Preparations',
  '21': 'Miscellaneous Edible Preparations',
  '22': 'Beverages & Vinegar',
  '23': 'Food Industry Residues',
  '24': 'Tobacco',
  '25': 'Salt, Sulphur, Earth & Stone',
  '26': 'Ores, Slag & Ash',
  '27': 'Mineral Fuels & Oils',
  '28': 'Inorganic Chemicals',
  '29': 'Organic Chemicals',
  '30': 'Pharmaceutical Products',
  '31': 'Fertilizers',
  '32': 'Tanning/Dyeing Extracts',
  '33': 'Essential Oils & Cosmetics',
  '34': 'Soap & Waxes',
  '35': 'Albuminoidal Substances',
  '36': 'Explosives',
  '37': 'Photographic Goods',
  '38': 'Miscellaneous Chemical Products',
  '39': 'Plastics',
  '40': 'Rubber',
  '41': 'Raw Hides & Skins',
  '42': 'Leather Articles',
  '43': 'Furskins',
  '44': 'Wood',
  '45': 'Cork',
  '46': 'Straw & Plaiting Materials',
  '47': 'Pulp',
  '48': 'Paper & Paperboard',
  '49': 'Printed Books & Newspapers',
  '50': 'Silk',
  '51': 'Wool',
  '52': 'Cotton',
  '53': 'Vegetable Textile Fibres',
  '54': 'Man-Made Filaments',
  '55': 'Man-Made Staple Fibres',
  '56': 'Wadding & Felt',
  '57': 'Carpets',
  '58': 'Special Woven Fabrics',
  '59': 'Impregnated Textile Fabrics',
  '60': 'Knitted/Crocheted Fabrics',
  '61': 'Knitted/Crocheted Apparel',
  '62': 'Woven Apparel',
  '63': 'Textile Articles',
  '64': 'Footwear',
  '65': 'Headgear',
  '66': 'Umbrellas & Walking Sticks',
  '67': 'Prepared Feathers',
  '68': 'Stone/Cement Articles',
  '69': 'Ceramic Products',
  '70': 'Glass',
  '71': 'Pearls & Precious Stones',
  '72': 'Iron & Steel',
  '73': 'Iron/Steel Articles',
  '74': 'Copper',
  '75': 'Nickel',
  '76': 'Aluminium',
  '78': 'Lead',
  '79': 'Zinc',
  '80': 'Tin',
  '81': 'Other Base Metals',
  '82': 'Tools & Cutlery',
  '83': 'Miscellaneous Base Metal Articles',
  '84': 'Machinery',
  '85': 'Electrical Machinery',
  '86': 'Railway/Tramway Locomotives',
  '87': 'Vehicles',
  '88': 'Aircraft & Spacecraft',
  '89': 'Ships & Boats',
  '90': 'Optical/Medical Instruments',
  '91': 'Clocks & Watches',
  '92': 'Musical Instruments',
  '93': 'Arms & Ammunition',
  '94': 'Furniture',
  '95': 'Toys & Games',
  '96': 'Miscellaneous Manufactured Articles',
  '97': 'Works of Art',
  '98': 'Special Classification Provisions',
  '99': 'Special Import/Export Provisions',
};

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const [cas, setCas] = useState<any[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/competent-authorities').then((res) => res.json()),
      fetch('/api/chapters').then((res) => res.json()),
    ])
      .then(([casData, chaptersData]) => {
        // Sort CAs: single codes first, then paired codes
        const sortedCas = casData
          .filter((ca: any) => ca.caCode !== '-') // Filter out hyphen CA
          .sort((a: any, b: any) => {
            // Check for newlines (paired CAs) or multiple words
            const aIsPaired = a.caCode.includes('\n') || a.caCode.includes(' ');
            const bIsPaired = b.caCode.includes('\n') || b.caCode.includes(' ');
            
            // Single CAs first, then paired CAs
            if (aIsPaired && !bIsPaired) return 1;
            if (!aIsPaired && bIsPaired) return -1;
            
            // Within same group, sort alphabetically
            return a.caCode.localeCompare(b.caCode);
          });
        
        setCas(sortedCas);
        setChapters(chaptersData);
      })
      .catch((err) => console.error('Failed to load filter data:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Search Type
        </label>
        <select
          id="type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="hs">HS Codes Only</option>
          <option value="product">Product Codes Only</option>
        </select>
      </div>

      <div>
        <label htmlFor="chapter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          HS Chapter
        </label>
        <select
          id="chapter"
          value={filters.chapter}
          onChange={(e) => setFilters({ ...filters, chapter: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Chapters</option>
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter} - {CHAPTER_NAMES[chapter] || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ca" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Competent Authority
        </label>
        <select
          id="ca"
          value={filters.ca}
          onChange={(e) => setFilters({ ...filters, ca: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Authorities</option>
          {cas.map((ca) => {
            const cleanCode = ca.caCode.replace(/\n/g, ' ');
            const cleanName = ca.caName.replace(/\n/g, ' ');
            // Show full name in title tooltip
            const tooltip = cleanName !== cleanCode ? cleanName : '';
            return (
              <option key={ca.caCode} value={ca.caCode} title={tooltip}>
                {cleanCode}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label htmlFor="dutiable" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Dutiability
        </label>
        <select
          id="dutiable"
          value={filters.dutiable}
          onChange={(e) => setFilters({ ...filters, dutiable: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="true">Dutiable Only</option>
          <option value="false">Non-Dutiable Only</option>
        </select>
      </div>
    </div>
  );
}
