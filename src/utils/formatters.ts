// Utility functions for formatting currency, dates, and numbers

/**
 * Format a number as currency.
 * @param {number} amount - The amount to be formatted.
 * @param {string} currencySymbol - The currency symbol.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount, currencySymbol) {
    return `${currencySymbol}${amount.toFixed(2)}`;
}

/**
 * Format a date to YYYY-MM-DD format.
 * @param {Date} date - The date to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Format a number with comma as thousand separator.
 * @param {number} number - The number to be formatted.
 * @returns {string} The formatted number string.
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Example Usage:
// console.log(formatCurrency(1234567.89, '$')); // $1234567.89
// console.log(formatDate(new Date())); // Output: current date in YYYY-MM-DD
// console.log(formatNumber(1234567)); // Output: 1,234,567
