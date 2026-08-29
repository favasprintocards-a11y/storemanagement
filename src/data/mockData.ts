import { InventoryItem } from '../types/inventory';

export const INITIAL_CATEGORIES: string[] = [
  'Paper & Media',
  'Apparel',
  'Vinyl & Signage',
  'Ink & Toners',
  'Merchandise',
  'Packaging'
];

export const INITIAL_PRODUCTS: InventoryItem[] = [
  {
    id: 'PRD-001',
    name: '300 GSM Glossy Card Stock (A4)',
    category: 'Paper & Media',
    quantity: 450,
    minThreshold: 100,
    unit: 'sheets',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80',
    supplier: 'PaperCo Ltd',
    description: 'Premium heavyweight glossy paper for business card printing.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'PRD-002',
    name: 'Cotton Heavyweight T-Shirt (Black, L)',
    category: 'Apparel',
    quantity: 18,
    minThreshold: 25,
    unit: 'pcs',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
    supplier: 'Textile Hub',
    description: '100% combed cotton blank t-shirts for screen printing.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'PRD-003',
    name: 'Matte Vinyl Roll (50m x 1.2m)',
    category: 'Vinyl & Signage',
    quantity: 12,
    minThreshold: 5,
    unit: 'rolls',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    supplier: 'SignCraft Supplies',
    description: 'High durability outdoor adhesive vinyl roll.',
    lastUpdated: new Date().toISOString()
  }
];

export const PRESET_IMAGES = [
  { label: 'Paper & Media', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80' },
  { label: 'Apparel', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80' },
  { label: 'Vinyl Roll', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' },
  { label: 'Mug / Merch', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80' },
  { label: 'Ink Cartridge', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80' },
  { label: 'Packaging Box', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80' }
];
