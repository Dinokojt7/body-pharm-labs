"use client";

import { createContext, useState, useEffect } from "react";
import currencyService from "@/lib/services/currency-service";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("ZAR");
  const [currencies, setCurrencies] = useState(currencyService.getCurrencies());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrencies = async () => {
      setLoading(true);
      const updated = await currencyService.fetchExchangeRates();
      setCurrencies(updated);
      setLoading(false);
    };

    loadCurrencies();
  }, []);

  const convertPrice = (amount) => {
    return currencyService.convertPrice(amount, "ZAR", selectedCurrency);
  };

  const formatPrice = (amount) => {
    const converted = convertPrice(amount);
    return currencyService.formatPrice(converted, selectedCurrency);
  };

  const getCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === selectedCurrency);
    return currency?.symbol || "R";
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    loading,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
