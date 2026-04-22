/**
 * Formats a number as Colombian peso currency.
 * @param {number} amount
 * @returns {string} e.g. "$1.234.567"
 */
export function formatCOP(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CO');
}
