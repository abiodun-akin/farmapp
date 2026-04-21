const ratesCache = new Map();

const fetchRatesForBase = async (base) => {
  const normalizedBase = String(base || "").toUpperCase();
  if (!normalizedBase) {
    return { base: "", rates: {} };
  }

  if (ratesCache.has(normalizedBase)) {
    return ratesCache.get(normalizedBase);
  }

  const response = await fetch(
    `https://open.er-api.com/v6/latest/${normalizedBase}`,
  );
  if (!response.ok) {
    throw new Error("Unable to fetch currency rates");
  }

  const payload = await response.json();
  const result = {
    base: normalizedBase,
    rates: payload?.rates || {},
  };
  ratesCache.set(normalizedBase, result);
  return result;
};

export const convertAmount = ({
  amount,
  fromCurrency,
  toCurrency,
  ratesByBase,
}) => {
  const sourceCurrency = String(fromCurrency || "").toUpperCase();
  const targetCurrency = String(toCurrency || "").toUpperCase();
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return { convertedAmount: null, converted: false };
  }

  if (!sourceCurrency || !targetCurrency || sourceCurrency === targetCurrency) {
    return { convertedAmount: numericAmount, converted: false };
  }

  const sourceRates = ratesByBase?.[sourceCurrency] || {};
  const rate = Number(sourceRates[targetCurrency]);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { convertedAmount: null, converted: false };
  }

  return {
    convertedAmount: numericAmount * rate,
    converted: true,
  };
};

export const loadRatesForCurrencies = async (baseCurrencies = []) => {
  const uniqueBases = Array.from(
    new Set(
      baseCurrencies
        .map((code) => String(code || "").toUpperCase())
        .filter(Boolean),
    ),
  );

  const results = await Promise.all(
    uniqueBases.map((base) => fetchRatesForBase(base)),
  );

  return results.reduce((acc, item) => {
    acc[item.base] = item.rates;
    return acc;
  }, {});
};
