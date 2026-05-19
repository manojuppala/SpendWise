import { useEffect, useState } from "react";
import { getCurrencySymbol } from "@/services/settingsService";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Hook to get and use the user's preferred currency symbol
 * Returns the currency symbol and automatically updates when settings change
 */
export const useCurrency = () => {
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    loadCurrency();
  }, []);

  // Refresh currency when screen gains focus (in case user changed it in settings)
  useFocusEffect(
    useCallback(() => {
      loadCurrency();
    }, [])
  );

  const loadCurrency = async () => {
    const symbol = await getCurrencySymbol();
    setCurrencySymbol(symbol);
  };

  /**
   * Format a number with the currency symbol
   * @param amount - The amount to format
   * @param showSign - Whether to show +/- sign for income/expense (optional)
   */
  const formatCurrency = (
    amount: number,
    showSign?: "+" | "-"
  ): string => {
    const formattedAmount = amount.toFixed(2);
    const sign = showSign ? `${showSign} ` : "";
    return `${sign}${currencySymbol}${formattedAmount}`;
  };

  return { currencySymbol, formatCurrency };
};
