export type DateRangePreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'specific_month' | 'custom';

/**
 * Checks whether a given timestamp string falls within a specified date range preset, specific month (YYYY-MM), or custom start/end dates.
 */
export function isWithinDateRange(
  timestampStr: string,
  dateRange: DateRangePreset | string,
  startDate?: string,
  endDate?: string,
  selectedMonth?: string
): boolean {
  if (!dateRange || dateRange === 'all') return true;
  if (!timestampStr) return false;

  const itemDate = new Date(timestampStr);
  if (isNaN(itemDate.getTime())) return true; // Fallback if invalid date format

  const now = new Date();

  if (dateRange === 'today') {
    return (
      itemDate.getDate() === now.getDate() &&
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }

  if (dateRange === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      itemDate.getDate() === yesterday.getDate() &&
      itemDate.getMonth() === yesterday.getMonth() &&
      itemDate.getFullYear() === yesterday.getFullYear()
    );
  }

  if (dateRange === '7days') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= sevenDaysAgo && itemDate <= now;
  }

  if (dateRange === '30days') {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return itemDate >= thirtyDaysAgo && itemDate <= now;
  }

  if (dateRange === 'this_month') {
    return (
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }

  if (dateRange === 'specific_month' || (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth))) {
    const targetMonthStr = selectedMonth || (dateRange.includes('-') ? dateRange : '');
    if (targetMonthStr && /^\d{4}-\d{2}$/.test(targetMonthStr)) {
      const [yearStr, monthStr] = targetMonthStr.split('-');
      const targetYear = parseInt(yearStr, 10);
      const targetMonth = parseInt(monthStr, 10) - 1; // 0-indexed month

      return (
        itemDate.getFullYear() === targetYear &&
        itemDate.getMonth() === targetMonth
      );
    }
  }

  if (dateRange === 'custom') {
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }

    return true;
  }

  return true;
}

/**
 * Returns a human-readable label for a date range preset or range.
 */
export function getDateRangeLabel(
  dateRange: string,
  startDate?: string,
  endDate?: string,
  selectedMonth?: string
): string {
  switch (dateRange) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case '7days':
      return 'Last 7 Days';
    case '30days':
      return 'Last 30 Days';
    case 'this_month':
      return 'This Month';
    case 'specific_month':
      if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      return 'Specific Month';
    case 'custom':
      if (startDate && endDate) return `${startDate} to ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
      return 'Custom Range';
    default:
      if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      return 'All Time';
  }
}
