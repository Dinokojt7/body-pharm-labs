import { useState, useEffect, useContext } from "react";
import { CurrencyContext } from "@/contexts/CurrencyContext";
import currencyService from "../services/currency-service";

export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
};

export const useCurrencyRates = () => {
  const [currencies, setCurrencies] = useState(currencyService.getCurrencies());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRates = async () => {
      try {
        setLoading(true);
        const updated = await currencyService.fetchExchangeRates();
        setCurrencies(updated);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRates();

    // Refresh rates every hour
    const interval = setInterval(loadRates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { currencies, loading, error };
};
