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
import { FilterBar } from './components/FilterBar';
import { LayoutGrid, Table } from 'lucide-react';
import { api } from './services/api';

import { 
  InventoryItem, 
  FilterOptions, 
  DashboardStats, 
  ToastMessage,
  StockHistoryLog
} from './types/inventory';
import { INITIAL_CATEGORIES } from './data/mockData';
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

  // Load initial data from backend API
  const loadInitialData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [fetchedCats, fetchedProds, fetchedLogs] = await Promise.all([
        api.fetchCategories(),
        api.fetchProducts(),
        api.fetchHistory()
      ]);
      setCategories(fetchedCats);
      setItems(fetchedProds);
      setHistoryLogs(fetchedLogs);
    } catch (err: any) {
      console.error('Failed to connect to backend server:', err);
      setApiError('Unable to connect to backend server. Make sure backend is running on http://localhost:5000');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchQuery, filters.category, filters.status, filters.dateRange, filters.startDate, filters.endDate, filters.sortField, filters.sortOrder]);

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

  const handleRenameCategory = (oldName: string, newName: string) => {
    setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    addToast('Category Renamed', `Renamed "${oldName}" to "${newName}".`, 'info');
  };

  const handleDeleteCategory = async (catName: string) => {
    try {
      const updatedCats = await api.deleteCategory(catName);
      setCategories(updatedCats);
      setItems((prev) => prev.filter((item) => item.category !== catName));
      if (filters.category === catName) {
        setFilters((prev) => ({ ...prev, category: 'All' }));
      }
      addToast('Category Deleted', `Category "${catName}" removed.`, 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  // Stock Adjustment Handler
  const handleConfirmStockAdjust = async (id: string, delta: number, note?: string) => {
    const type = delta >= 0 ? 'add' : 'minus';
    const absDelta = Math.abs(delta);

    try {
      const { product, log } = await api.adjustStock(id, type, absDelta, note);

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
        addToast('Product Updated', `Successfully updated "${updated.name}".`, 'success');
      } else {
        const created = await api.createProduct(formData);
        setItems((prev) => [created, ...prev]);
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
    try {
      await api.deleteProduct(deletingItem.id);
      setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
      const updatedLogs = await api.fetchHistory();
      setHistoryLogs(updatedLogs);
      addToast('Product Deleted', `"${deletingItem.name}" has been removed.`, 'info');
    } catch (err: any) {
      addToast('Delete Failed', err.message, 'error');
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
      const updatedLogs = await api.deleteHistoryLog(logId);
      setHistoryLogs(updatedLogs);
      addToast('Log Deleted', 'History record removed.', 'info');
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

      const matchesDate = isWithinDateRange(item.lastUpdated, filters.dateRange, filters.startDate, filters.endDate);

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

        {/* Global Operational Filter Bar */}
        <FilterBar
          searchQuery={filters.searchQuery}
          onSearchChange={(searchQuery) => setFilters((prev) => ({ ...prev, searchQuery }))}
          selectedCategory={filters.category}
          onCategoryChange={(category) => setFilters((prev) => ({ ...prev, category }))}
          selectedStatus={filters.status}
          onStatusChange={(status) => setFilters((prev) => ({ ...prev, status }))}
          selectedDateRange={filters.dateRange}
          onDateRangeChange={(dateRange) => setFilters((prev) => ({ ...prev, dateRange }))}
          startDate={filters.startDate}
          onStartDateChange={(startDate) => setFilters((prev) => ({ ...prev, startDate }))}
          endDate={filters.endDate}
          onEndDateChange={(endDate) => setFilters((prev) => ({ ...prev, endDate }))}
          categories={categories}
          historyLogsCount={historyLogs.length}
          onAddProductClick={() => {
            setEditingItem(null);
            setFormDefaultCategory(categories[0] || 'Paper & Media');
            setIsFormOpen(true);
          }}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onExportCSV={handleExportCSV}
          onResetData={handleResetData}
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
