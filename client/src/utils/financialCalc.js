/**
 * Monthly loan payment (French amortization).
 * @param {number} P - Principal
 * @param {number} r - Monthly rate as decimal (e.g. 0.025 for 2.5%)
 * @param {number} n - Term in months
 * @returns {number}
 */
export function calcMonthlyPayment(P, r, n) {
  const factor = Math.pow(1 + r, n);
  return P * (r * factor) / (factor - 1);
}

/**
 * Total interest paid over the life of a loan.
 * @param {number} monthlyPayment
 * @param {number} n - Term in months
 * @param {number} P - Principal
 * @returns {number}
 */
export function calcTotalInterest(monthlyPayment, n, P) {
  return (monthlyPayment * n) - P;
}

/**
 * Total cost of a loan (principal + interest).
 * @param {number} monthlyPayment
 * @param {number} n - Term in months
 * @returns {number}
 */
export function calcTotalCost(monthlyPayment, n) {
  return monthlyPayment * n;
}

/**
 * Monthly and annual impact of an "ant expense".
 * @param {number} unitCost - Cost per occurrence
 * @param {number} timesPerMonth - Frequency per month
 * @returns {{ monthlyTotal: number, annualImpact: number }}
 */
export function calcAntImpact(unitCost, timesPerMonth) {
  const monthlyTotal = unitCost * timesPerMonth;
  return {
    monthlyTotal,
    annualImpact: monthlyTotal * 12,
  };
}

/**
 * Simple linear savings projection.
 * @param {number} monthlySavings
 * @param {number} months
 * @returns {number}
 */
export function calcSavingsProjection(monthlySavings, months) {
  return monthlySavings * months;
}

/**
 * Financial health indicator.
 * @param {number} savings - Available savings (can be negative)
 * @param {number} income  - Total income
 * @returns {'SALUDABLE'|'AJUSTADO'|'DEFICIT'}
 */
export function calcFinancialHealth(savings, income) {
  if (income === 0) {
    return savings < 0 ? 'DEFICIT' : 'AJUSTADO';
  }
  if (savings / income > 0.10) return 'SALUDABLE';
  if (savings >= 0) return 'AJUSTADO';
  return 'DEFICIT';
}
