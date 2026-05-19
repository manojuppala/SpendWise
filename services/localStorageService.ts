import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType, WalletType, TransactionType } from "@/types";

const STORAGE_KEYS = {
  GUEST_MODE: "@guest_mode",
  GUEST_USER: "@guest_user",
  GUEST_WALLETS: "@guest_wallets",
  GUEST_TRANSACTIONS: "@guest_transactions",
};

// Guest User Management
export const setGuestMode = async (isGuest: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.GUEST_MODE, JSON.stringify(isGuest));
};

export const isGuestMode = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
  return value === "true";
};

export const setGuestUser = async (user: UserType): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.GUEST_USER, JSON.stringify(user));
};

export const getGuestUser = async (): Promise<UserType | null> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_USER);
  return value ? JSON.parse(value) : null;
};

// Wallet Management
export const saveGuestWallets = async (wallets: WalletType[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.GUEST_WALLETS, JSON.stringify(wallets));
};

export const getGuestWallets = async (): Promise<WalletType[]> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_WALLETS);
  return value ? JSON.parse(value) : [];
};

export const getGuestWallet = async (walletId: string): Promise<WalletType | null> => {
  const wallets = await getGuestWallets();
  return wallets.find((w) => w.id === walletId) || null;
};

export const addGuestWallet = async (wallet: WalletType): Promise<WalletType> => {
  const wallets = await getGuestWallets();
  const newWallet = {
    ...wallet,
    id: wallet.id || `wallet_${Date.now()}`,
    amount: wallet.amount !== undefined ? wallet.amount : 0,
    totalIncome: wallet.totalIncome !== undefined ? wallet.totalIncome : 0,
    totalExpenses: wallet.totalExpenses !== undefined ? wallet.totalExpenses : 0,
    created: wallet.created || new Date().toISOString(),
    uid: "guest",
  };
  wallets.push(newWallet);
  await saveGuestWallets(wallets);
  return newWallet;
};

export const updateGuestWallet = async (
  walletId: string,
  updates: Partial<WalletType>,
): Promise<WalletType | null> => {
  const wallets = await getGuestWallets();
  const index = wallets.findIndex((w) => w.id === walletId);
  if (index === -1) return null;

  wallets[index] = { ...wallets[index], ...updates };
  await saveGuestWallets(wallets);
  return wallets[index];
};

export const deleteGuestWallet = async (walletId: string): Promise<void> => {
  const wallets = await getGuestWallets();
  const filtered = wallets.filter((w) => w.id !== walletId);
  await saveGuestWallets(filtered);

  // Also delete associated transactions
  const transactions = await getGuestTransactions();
  const filteredTransactions = transactions.filter((t) => t.walletId !== walletId);
  await saveGuestTransactions(filteredTransactions);
};

// Transaction Management
export const saveGuestTransactions = async (transactions: TransactionType[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.GUEST_TRANSACTIONS, JSON.stringify(transactions));
};

export const getGuestTransactions = async (): Promise<TransactionType[]> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_TRANSACTIONS);
  return value ? JSON.parse(value) : [];
};

export const addGuestTransaction = async (
  transaction: TransactionType,
): Promise<TransactionType> => {
  const transactions = await getGuestTransactions();
  const newTransaction = {
    ...transaction,
    id: transaction.id || `transaction_${Date.now()}`,
    uid: "guest",
    date: transaction.date || new Date().toISOString(),
  };
  transactions.push(newTransaction);
  await saveGuestTransactions(transactions);
  return newTransaction;
};

export const updateGuestTransaction = async (
  transactionId: string,
  updates: Partial<TransactionType>,
): Promise<TransactionType | null> => {
  const transactions = await getGuestTransactions();
  const index = transactions.findIndex((t) => t.id === transactionId);
  if (index === -1) return null;

  transactions[index] = { ...transactions[index], ...updates };
  await saveGuestTransactions(transactions);
  return transactions[index];
};

export const deleteGuestTransaction = async (transactionId: string): Promise<void> => {
  const transactions = await getGuestTransactions();
  const filtered = transactions.filter((t) => t.id !== transactionId);
  await saveGuestTransactions(filtered);
};

// Clear all guest data
export const clearGuestData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.GUEST_MODE,
    STORAGE_KEYS.GUEST_USER,
    STORAGE_KEYS.GUEST_WALLETS,
    STORAGE_KEYS.GUEST_TRANSACTIONS,
  ]);
};

// Get all guest data for migration
export const getAllGuestData = async () => {
  const [user, wallets, transactions] = await Promise.all([
    getGuestUser(),
    getGuestWallets(),
    getGuestTransactions(),
  ]);

  return {
    user,
    wallets,
    transactions,
  };
};
