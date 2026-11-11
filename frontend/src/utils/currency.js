/**
 * Currency Utility for Ethiopian Birr (ETB) and USD
 */

export const DEFAULT_EXCHANGE_RATE = 120.0; // 1 USD = 120 ETB

export const getStoredCurrency = () => {
  return localStorage.getItem('store_currency') || 'ETB';
};

export const setStoredCurrency = (currency) => {
  localStorage.setItem('store_currency', currency);
  window.dispatchEvent(new Event('currencyChange'));
};

export const convertPrice = (usdAmount, targetCurrency = 'ETB', rate = DEFAULT_EXCHANGE_RATE) => {
  if (typeof usdAmount !== 'number') {
    usdAmount = parseFloat(usdAmount) || 0;
  }
  if (targetCurrency === 'USD') {
    return usdAmount;
  }
  return Math.round(usdAmount * rate * 100) / 100;
};

export const formatPrice = (usdAmount, currency = null, rate = DEFAULT_EXCHANGE_RATE) => {
  if (typeof usdAmount !== 'number') {
    usdAmount = parseFloat(usdAmount) || 0;
  }
  const curr = currency || getStoredCurrency();
  if (curr === 'USD') {
    return `$${usdAmount.toFixed(2)}`;
  }
  const etb = convertPrice(usdAmount, 'ETB', rate);
  return `${etb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
};

