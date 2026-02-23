// Utility functions for formatting currency, dates, and numbers

export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
