const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wholeMoney = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** $1,234.50 (sign handled by the caller). */
export const formatMoney = (amount: number): string => `$${money.format(Math.abs(amount))}`;
export const formatWholeMoney = (amount: number): string => `$${wholeMoney.format(amount)}`;
export const formatNumber = (value: number): string => wholeMoney.format(value);
export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
export const formatSignedMoney = (amount: number): string => `${amount < 0 ? '-' : ''}${formatMoney(amount)}`;
export const userCode = (id: number): string => `#USR-${String(id).padStart(4, '0')}`;
