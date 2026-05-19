import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEYS = {
  CURRENCY_SYMBOL: "@currency_symbol",
};

// Default currency symbols
export const CURRENCY_SYMBOLS = [
  { label: "US Dollar ($)", value: "$" },
  { label: "Euro (€)", value: "€" },
  { label: "British Pound (£)", value: "£" },
  { label: "Indian Rupee (₹)", value: "₹" },
  { label: "Japanese Yen (¥)", value: "¥" },
  { label: "Chinese Yuan (¥)", value: "¥" },
  { label: "Canadian Dollar (C$)", value: "C$" },
  { label: "Australian Dollar (A$)", value: "A$" },
  { label: "Swiss Franc (CHF)", value: "CHF" },
  { label: "Brazilian Real (R$)", value: "R$" },
  { label: "South African Rand (R)", value: "R" },
  { label: "Mexican Peso ($)", value: "$" },
];

// Currency Symbol Management
export const getCurrencySymbol = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEYS.CURRENCY_SYMBOL);
    return value || "$"; // Default to USD
  } catch (error) {
    console.error("Error getting currency symbol:", error);
    return "$";
  }
};

export const setCurrencySymbol = async (symbol: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEYS.CURRENCY_SYMBOL, symbol);
  } catch (error) {
    console.error("Error setting currency symbol:", error);
  }
};

// Clear all settings
export const clearSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEYS.CURRENCY_SYMBOL);
  } catch (error) {
    console.error("Error clearing settings:", error);
  }
};
