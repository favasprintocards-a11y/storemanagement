import { InventoryItem, StockHistoryLog } from '../types/inventory';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  // Categories
  async fetchCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async addCategory(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add category');
    }
    return res.json();
  },

  async deleteCategory(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete category');
    }
    return res.json();
  },

  // Products
  async fetchProducts(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createProduct(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
    return res.json();
  },

  // Stock History & Adjustment
  async fetchHistory(): Promise<StockHistoryLog[]> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async adjustStock(productId: string, type: 'add' | 'minus', changeQty: number, note?: string): Promise<{ product: InventoryItem; log: StockHistoryLog }> {
    const res = await fetch(`${API_BASE}/history/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, type, changeQty, note })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to adjust stock');
    }
    return res.json();
  },

  async deleteHistoryLog(id: string): Promise<StockHistoryLog[]> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete history log');
    return res.json();
  },

  async clearHistoryLogs(): Promise<StockHistoryLog[]> {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear history logs');
    return res.json();
  }
};
