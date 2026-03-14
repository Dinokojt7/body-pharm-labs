import axios from "axios";

const CURRENCIES = [
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 1, flag: "🇿🇦" },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.054, flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.049, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.042, flag: "🇬🇧" },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    rate: 0.073,
    flag: "🇨🇦",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    rate: 0.082,
    flag: "🇦🇺",
  },
];

class CurrencyService {
  constructor() {
    this.baseCurrency = "ZAR";
    this.rates = {};
    this.lastUpdated = null;
    this.currencies = CURRENCIES;
  }

  async fetchExchangeRates() {
    try {
      // Using a free exchange rate API (you might want to use a paid one for production)
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`,
      );

      this.rates = response.data.rates;
      this.lastUpdated = new Date();

      // Update our currency objects with real rates
      this.currencies = this.currencies.map((currency) => ({
        ...currency,
        rate: this.rates[currency.code] || currency.rate,
      }));

      return this.currencies;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      return this.currencies; // Return default rates on error
    }
  }

  getCurrencies() {
    return this.currencies;
  }

  convertPrice(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const fromRate =
      this.currencies.find((c) => c.code === fromCurrency)?.rate || 1;
    const toRate =
      this.currencies.find((c) => c.code === toCurrency)?.rate || 1;

    // Convert to base currency (ZAR) first, then to target
    const inBase = amount / fromRate;
    return inBase * toRate;
  }

  formatPrice(amount, currencyCode) {
    const currency = this.currencies.find((c) => c.code === currencyCode);
    if (!currency) return `R ${amount.toFixed(2)}`;

    return `${currency.symbol} ${amount.toFixed(2)}`;
  }
}

export default new CurrencyService();
