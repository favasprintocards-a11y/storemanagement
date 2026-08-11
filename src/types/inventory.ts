export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  status: StockStatus;
  image?: string;
  supplier?: string;
  description?: string;
  lastUpdated: string;
}

export interface StockHistoryLog {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: 'add' | 'minus' | 'create' | 'delete' | 'edit';
  changeQty: number;
  previousQty: number;
  newQty: number;
  unit: string;
  timestamp: string;
  note?: string;
}

export type SortField = 'name' | 'quantity' | 'id';
export type SortOrder = 'asc' | 'desc';

export type DateRangeFilter = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'specific_month' | 'custom';

export interface FilterOptions {
  searchQuery: string;
  category: string;
  status: string;
  dateRange: DateRangeFilter;
  startDate?: string;
  endDate?: string;
  selectedMonth?: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface DashboardStats {
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
