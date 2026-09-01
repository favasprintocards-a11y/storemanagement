import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { InventoryTable } from './components/InventoryTable';
import { CategoryDrilldownView } from './components/CategoryDrilldownView';
import { ProductFormModal } from './components/ProductFormModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { StockAdjustModal } from './components/StockAdjustModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';
import { LayoutGrid, Table } from 'lucide-react';
import { api } from './services/api';

import { 
  InventoryItem, 
  FilterOptions, 
  DashboardStats, 
  ToastMessage,
  StockHistoryLog
} from './types/inventory';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './data/mockData';
import { isWithinDateRange } from './utils/dateUtils';

const THEME_STORAGE_KEY = 'printo_theme_preference';

export const App: React.FC = () => {
  // Theme State (Default: White / Light theme)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // View Mode: 'cards' (3-Tier Category Cards Flow) | 'table' (Data Grid)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Backend States
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [historyLogs, setHistoryLogs] = useState<StockHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters & Sorting State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'All',
    status: 'All',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    selectedMonth: '',
    sortField: 'name',
    sortOrder: 'asc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formDefaultCategory, setFormDefaultCategory] = useState<string>('Paper & Media');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Stock History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<string | null>(null);

  // Stock Adjustment Count Modal State
  const [stockAdjustModal, setStockAdjustModal] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
    mode: 'add' | 'minus';
  }>({
    isOpen: false,
    item: null,
    mode: 'add'
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search input DOM ref for header quick trigger
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial data with local persistent storage fallback
  const loadInitialData = async () => {
    setIsLoading(true);
    setApiError(null);

    // 1. Load from localStorage cache first for instant display
    const cachedCats = localStorage.getItem('printo_categories');
    const cachedItems = localStorage.getItem('printo_inventory_items');
    const cachedLogs = localStorage.getItem('printo_history_logs');

    let initialCats: string[] = [];
    let initialItems: InventoryItem[] = [];
    let initialLogs: StockHistoryLog[] = [];

    if (cachedCats) {
      try {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed)) initialCats = parsed;
      } catch (e) {}
    }

    if (cachedItems) {
      try {
        const parsed = JSON.parse(cachedItems);
        if (Array.isArray(parsed)) initialItems = parsed;
      } catch (e) {}
    }

    if (cachedLogs) {
      try {
        const parsed = JSON.parse(cachedLogs);
        if (Array.isArray(parsed)) initialLogs = parsed;
      } catch (e) {}
    }

    setCategories(initialCats);
    setItems(initialItems);
    setHistoryLogs(initialLogs);

    // 2. Fetch live data from backend server
    try {
      const [fetchedCats, fetchedProds, fetchedLogs] = await Promise.all([
        api.fetchCategories(),
        api.fetchProducts(),
        api.fetchHistory()
      ]);

      const serverCats = Array.isArray(fetchedCats) ? fetchedCats : [];
      const serverProds = Array.isArray(fetchedProds) ? fetchedProds : [];
      const serverLogs = Array.isArray(fetchedLogs) ? fetchedLogs : [];

      // Helper function to deduplicate products by ID and by normalized name
      const dedupeItemsList = (prodList: InventoryItem[]): InventoryItem[] => {
        const idMap = new Map<string, InventoryItem>();
        const nameMap = new Map<string, InventoryItem>();

        for (const item of prodList) {
          if (!item || !item.name) continue;
          const normName = item.name.trim().toLowerCase();
          const existingById = item.id ? idMap.get(item.id) : undefined;
          const existingByName = nameMap.get(normName);
          const existing = existingById || existingByName;

          if (!existing) {
            if (item.id) idMap.set(item.id, item);
            nameMap.set(normName, item);
          } else {
            const existingTime = new Date(existing.lastUpdated || 0).getTime();
            const itemTime = new Date(item.lastUpdated || 0).getTime();
            if (itemTime >= existingTime) {
              if (existing.id) idMap.delete(existing.id);
              if (item.id) idMap.set(item.id, item);
              nameMap.set(normName, item);
            }
          }
        }
        return Array.from(nameMap.values());
      };

      const finalItems = dedupeItemsList(serverProds);
      const finalCats = Array.from(new Set(serverCats));

      const logMap = new Map<string, StockHistoryLog>();
      serverLogs.forEach(log => { if (log && log.id) logMap.set(log.id, log); });
      const finalLogs = Array.from(logMap.values()).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      setCategories(finalCats);
      setItems(finalItems);
      setHistoryLogs(finalLogs);

      localStorage.setItem('printo_categories', JSON.stringify(finalCats));
      localStorage.setItem('printo_inventory_items', JSON.stringify(finalItems));
      localStorage.setItem('printo_history_logs', JSON.stringify(finalLogs));
    } catch (err: any) {
      console.warn('Backend server fetch warning (using local persistent storage):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Persistent localStorage auto-sync
  useEffect(() => {
    localStorage.setItem('printo_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('printo_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('printo_history_logs', JSON.stringify(historyLogs));
  }, [historyLogs]);

  // Sync HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchQuery, filters.category, filters.status, filters.dateRange, filters.startDate, filters.endDate, filters.selectedMonth, filters.sortField, filters.sortOrder]);

  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id: newId, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newId));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Category CRUD Handlers
  const handleAddCategory = async (newCatName: string) => {
    try {
      const updatedCats = await api.addCategory(newCatName);
      setCategories(updatedCats);
      setFilters((prev) => ({ ...prev, category: newCatName }));
      addToast('Category Created', `Category "${newCatName}" added.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const normOld = oldName.trim().toLowerCase();
    const trimmedNew = newName.trim();

    // Optimistic UI updates
    setCategories((prev) => prev.map((c) => (c.trim().toLowerCase() === normOld ? trimmedNew : c)));
    setItems((prev) =>
      prev.map((item) =>
        item.category && item.category.trim().toLowerCase() === normOld
          ? { ...item, category: trimmedNew }
          : item
      )
    );
    setHistoryLogs((prev) =>
      prev.map((log) =>
        log.category && log.category.trim().toLowerCase() === normOld
          ? { ...log, category: trimmedNew }
          : log
      )
    );
    if (filters.category.trim().toLowerCase() === normOld) {
      setFilters((prev) => ({ ...prev, category: trimmedNew }));
    }

    try {
      const response = await api.renameCategory(oldName, newName);
      if (response && Array.isArray(response.categories)) {
        setCategories(response.categories);
      }
      if (response && Array.isArray(response.products)) {
        setItems(response.products);
      }
      addToast('Category Renamed', `Renamed "${oldName}" to "${newName}".`, 'success');
    } catch (err: any) {
      console.warn('Category rename warning:', err.message);
      addToast('Category Renamed', `Renamed "${oldName}" to "${newName}" locally.`, 'info');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const normTarget = catName.trim().toLowerCase();
    setCategories((prev) => prev.filter((c) => c.trim().toLowerCase() !== normTarget));
    setItems((prev) => prev.filter((item) => item.category.trim().toLowerCase() !== normTarget));
    if (filters.category.trim().toLowerCase() === normTarget) {
      setFilters((prev) => ({ ...prev, category: 'All' }));
    }

    try {
      const updatedCats = await api.deleteCategory(catName);
      if (Array.isArray(updatedCats)) {
        setCategories(updatedCats);
      }
      addToast('Category Deleted', `Category "${catName}" removed.`, 'info');
    } catch (err: any) {
      console.warn('Category delete notification:', err.message);
      addToast('Category Removed', `Category "${catName}" removed from local list.`, 'info');
    }
  };

  // Stock Adjustment Handler
  const handleConfirmStockAdjust = async (id: string, delta: number, note?: string, timestamp?: string) => {
    const type = delta >= 0 ? 'add' : 'minus';
    const absDelta = Math.abs(delta);

    try {
      const { product, log } = await api.adjustStock(id, type, absDelta, note, timestamp);

      setItems((prev) => prev.map((item) => (item.id === id ? product : item)));
      setHistoryLogs((prev) => [log, ...prev]);

      if (type === 'add') {
        addToast('Stock Added', `+${absDelta} ${product.unit} added to "${product.name}". Total: ${product.quantity}`, 'success');
      } else {
        addToast('Stock Reduced', `-${absDelta} ${product.unit} reduced from "${product.name}". Total: ${product.quantity}`, 'info');
      }
    } catch (err: any) {
      addToast('Stock Adjustment Failed', err.message, 'error');
    }
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (formData: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        const updated = await api.updateProduct(editingItem.id, formData);
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? updated : item)));
        if (updated.category && !categories.includes(updated.category)) {
          try {
            const updatedCats = await api.addCategory(updated.category);
            setCategories(updatedCats);
          } catch (e) {
            setCategories((prev) => Array.from(new Set([...prev, updated.category])));
          }
        }
        addToast('Product Updated', `Successfully updated "${updated.name}".`, 'success');
      } else {
        const created = await api.createProduct(formData);
        setItems((prev) => [created, ...prev]);
        if (created.category && !categories.includes(created.category)) {
          try {
            const updatedCats = await api.addCategory(created.category);
            setCategories(updatedCats);
          } catch (e) {
            setCategories((prev) => Array.from(new Set([...prev, created.category])));
          }
        }
        const updatedLogs = await api.fetchHistory();
        setHistoryLogs(updatedLogs);
        addToast('Product Added', `"${created.name}" created under "${created.category}".`, 'success');
      }
    } catch (err: any) {
      addToast('Error Saving Product', err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const targetId = deletingItem.id;
    const targetName = deletingItem.name;

    // Immediately remove from UI and localStorage
    setItems((prev) => prev.filter((item) => item.id !== targetId));

    try {
      await api.deleteProduct(targetId);
      addToast('Product Deleted', `"${targetName}" has been removed.`, 'info');
      const updatedLogs = await api.fetchHistory();
      setHistoryLogs(updatedLogs);
    } catch (err: any) {
      console.warn('Product delete API notification:', err.message);
      addToast('Product Removed', `"${targetName}" removed from list.`, 'info');
    } finally {
      setIsDeleteOpen(false);
      setDeletingItem(null);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Clear all products from inventory?')) {
      try {
        for (const item of items) {
          await api.deleteProduct(item.id);
        }
        setItems([]);
        addToast('Inventory Cleared', 'All products removed from server.', 'info');
      } catch (err: any) {
        addToast('Error', err.message, 'error');
      }
    }
  };

  const handleDeleteHistoryLog = async (logId: string) => {
    try {
      const res = await api.deleteHistoryLog(logId);
      if (res.logs) {
        setHistoryLogs(res.logs);
      }
      if (res.products && res.products.length > 0) {
        setItems(res.products);
      } else {
        const fetchedProds = await api.fetchProducts();
        setItems(fetchedProds);
      }
      addToast('Log Deleted', 'History record removed and product stock updated.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleClearHistoryLogs = async () => {
    try {
      await api.clearHistoryLogs();
      setHistoryLogs([]);
      addToast('History Cleared', 'All history records removed.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  // Filter & Sort Computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchesCategory = filters.category === 'All' || item.category === filters.category;

      const qty = Number(item.quantity || 0);
      const min = Number(item.minThreshold || 0);
      let calculatedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (qty <= 0) {
        calculatedStatus = 'Out of Stock';
      } else if (qty <= min) {
        calculatedStatus = 'Low Stock';
      }

      const matchesStatus =
        filters.status === 'All' ||
        calculatedStatus === filters.status ||
        item.status === filters.status;

      const matchesDate = isWithinDateRange(item.lastUpdated, filters.dateRange, filters.startDate, filters.endDate, filters.selectedMonth);

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    }).sort((a, b) => {
      const field = filters.sortField;
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      if (field === 'name') return a.name.localeCompare(b.name) * order;
      if (field === 'id') return a.id.localeCompare(b.id) * order;
      if (field === 'quantity') return (a.quantity - b.quantity) * order;
      return 0;
    });
  }, [items, filters]);

  // Paginated View
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Stats - Dynamically calculated based on unique product names and quantity thresholds
  const dashboardStats: DashboardStats = useMemo(() => {
    const uniqueNames = new Set(items.map((item) => item.name.trim().toLowerCase()));
    const totalItems = uniqueNames.size;
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const lowStockCount = items.filter((item) => item.quantity > 0 && item.quantity <= item.minThreshold).length;
    const outOfStockCount = items.filter((item) => item.quantity <= 0).length;

    return {
      totalItems,
      totalQuantity,
      lowStockCount,
      outOfStockCount
    };
  }, [items]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Product Name', 'Category', 'Quantity', 'Unit', 'Status'];
    const rows = filteredItems.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      item.category,
      item.quantity,
      item.unit,
      item.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `printo_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export Successful', 'Inventory report exported as CSV.', 'success');
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Primary Header - Logo Only */}
      <Navbar />

      {/* Backend API Connection Alert Banner */}
      {apiError && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-900 px-6 py-3 text-sm flex items-center justify-between">
          <span>⚠️ {apiError}</span>
          <button 
            onClick={loadInitialData} 
            className="underline font-semibold hover:text-amber-700 ml-4"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Store Management Dashboard</h1>
        </div>

        {/* Top Operational Metrics */}
        <DashboardMetrics 
          stats={dashboardStats} 
          activeStatusFilter={filters.status}
          onFilterByStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
        />



        {/* Dynamic View Mode Renderer */}
        {viewMode === 'cards' ? (
          <CategoryDrilldownView
            categories={categories}
            items={filteredItems}
            searchQuery={filters.searchQuery}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
            onDeleteCategory={handleDeleteCategory}
            onOpenStockAdjustModal={(item, mode) => {
              setStockAdjustModal({ isOpen: true, item, mode });
            }}
            onViewProductHistory={(item) => {
              setSelectedHistoryProduct(item.id);
              setIsHistoryModalOpen(true);
            }}
            onEditProduct={(item) => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onDeleteProduct={(item) => {
              setDeletingItem(item);
              setIsDeleteOpen(true);
            }}
            onAddProductClick={(category) => {
              setEditingItem(null);
              setFormDefaultCategory(category || categories[0] || 'Paper & Media');
              setIsFormOpen(true);
            }}
          />
        ) : (
          <InventoryTable
            items={paginatedItems}
            sortField={filters.sortField}
            sortOrder={filters.sortOrder}
            onSort={(field) => setFilters((prev) => ({ 
              ...prev, 
              sortField: field, 
              sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
            onOpenStockAdjustModal={(item, mode) => {
              setStockAdjustModal({ isOpen: true, item, mode });
            }}
            onViewProductHistory={(item) => {
              setSelectedHistoryProduct(item.id);
              setIsHistoryModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onDelete={(item) => {
              setDeletingItem(item);
              setIsDeleteOpen(true);
            }}
            currentPage={currentPage}
            pageSize={pageSize}
            totalFilteredCount={filteredItems.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        )}
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        categories={categories}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveProduct}
        editItem={editingItem}
        defaultCategory={formDefaultCategory}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        categories={categories}
        items={items}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <StockAdjustModal
        isOpen={stockAdjustModal.isOpen}
        item={stockAdjustModal.item}
        mode={stockAdjustModal.mode}
        onClose={() => setStockAdjustModal({ isOpen: false, item: null, mode: 'add' })}
        onConfirmAdjust={handleConfirmStockAdjust}
      />

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        historyLogs={historyLogs}
        categories={categories}
        selectedProductFilter={selectedHistoryProduct}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedHistoryProduct(null);
        }}
        onClearHistory={handleClearHistoryLogs}
        onDeleteLog={handleDeleteHistoryLog}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        item={deletingItem}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default App;
