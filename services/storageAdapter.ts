/**
 * Storage Adapter - Automatically routes to local storage for guests or Supabase for authenticated users
 */

import {
  isGuestMode,
  getGuestWallets,
  addGuestWallet,
  updateGuestWallet,
  deleteGuestWallet,
  getGuestTransactions,
  addGuestTransaction,
  updateGuestTransaction,
  deleteGuestTransaction,
} from "./localStorageService";
import {
  createOrUpdateWallet as supabaseCreateOrUpdateWallet,
  deleteWallet as supabaseDeleteWallet,
} from "./walletService";
import {
  createOrUpdateTransaction as supabaseCreateOrUpdateTransaction,
  deleteTransaction as supabaseDeleteTransaction,
  updateWalletForNewTransaction,
  revertAndUpdateWallets,
} from "./transactionService";
import { WalletType, TransactionType, ResponseType } from "@/types";
import { supabase } from "@/config/supabase";

// Wallet Operations
export const createOrUpdateWalletAdapter = async (
  walletData: Partial<WalletType>,
): Promise<ResponseType> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    try {
      if (walletData.id) {
        // Update existing wallet
        const updated = await updateGuestWallet(walletData.id, walletData);
        return { success: true, data: updated };
      } else {
        // Create new wallet
        const newWallet = await addGuestWallet(walletData as WalletType);
        return { success: true, data: newWallet };
      }
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  } else {
    return supabaseCreateOrUpdateWallet(walletData);
  }
};

export const deleteWalletAdapter = async (walletId: string): Promise<ResponseType> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    try {
      await deleteGuestWallet(walletId);
      return { success: true, msg: "Wallet deleted successfully" };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  } else {
    return supabaseDeleteWallet(walletId);
  }
};

export const getWalletsAdapter = async (uid: string): Promise<WalletType[]> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    return getGuestWallets();
  } else {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("uid", uid)
      .order("created", { ascending: false });

    return data || [];
  }
};

// Transaction Operations
export const createOrUpdateTransactionAdapter = async (
  transactionData: Partial<TransactionType>,
): Promise<ResponseType> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    try {
      const { id, type, amount, walletId } = transactionData;

      if (!amount || amount <= 0 || !walletId || !type) {
        return { success: false, msg: "Invalid transaction data!" };
      }

      // Update wallet balances
      const wallets = await getGuestWallets();
      const wallet = wallets.find((w) => w.id === walletId);

      if (!wallet) {
        return { success: false, msg: "Wallet not found!" };
      }

      if (id) {
        // Updating existing transaction
        const transactions = await getGuestTransactions();
        const oldTransaction = transactions.find((t) => t.id === id);

        if (oldTransaction) {
          // Revert old transaction effect
          const revertAmount =
            oldTransaction.type === "income" ? -oldTransaction.amount : oldTransaction.amount;
          wallet.amount = (wallet.amount || 0) + revertAmount;

          if (oldTransaction.type === "income") {
            wallet.totalIncome = (wallet.totalIncome || 0) - oldTransaction.amount;
          } else {
            wallet.totalExpenses = (wallet.totalExpenses || 0) - oldTransaction.amount;
          }
        }
      }

      // Apply new transaction
      const newAmount = type === "income" ? amount : -amount;
      wallet.amount = (wallet.amount || 0) + newAmount;

      if (type === "income") {
        wallet.totalIncome = (wallet.totalIncome || 0) + amount;
      } else {
        wallet.totalExpenses = (wallet.totalExpenses || 0) + amount;
      }

      if (type === "expense" && wallet.amount < 0) {
        return { success: false, msg: "Insufficient balance in wallet" };
      }

      await updateGuestWallet(walletId, wallet);

      // Save transaction
      let savedTransaction;
      if (id) {
        savedTransaction = await updateGuestTransaction(id, transactionData);
      } else {
        savedTransaction = await addGuestTransaction(transactionData as TransactionType);
      }

      return { success: true, data: savedTransaction };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  } else {
    return supabaseCreateOrUpdateTransaction(transactionData);
  }
};

export const deleteTransactionAdapter = async (
  transactionId: string,
  walletId: string,
): Promise<ResponseType> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    try {
      const transactions = await getGuestTransactions();
      const transaction = transactions.find((t) => t.id === transactionId);

      if (!transaction) {
        return { success: false, msg: "Transaction not found" };
      }

      // Update wallet
      const wallets = await getGuestWallets();
      const wallet = wallets.find((w) => w.id === walletId);

      if (wallet) {
        const revertAmount =
          transaction.type === "income" ? -transaction.amount : transaction.amount;
        wallet.amount = (wallet.amount || 0) + revertAmount;

        if (transaction.type === "income") {
          wallet.totalIncome = (wallet.totalIncome || 0) - transaction.amount;
        } else {
          wallet.totalExpenses = (wallet.totalExpenses || 0) - transaction.amount;
        }

        if (wallet.amount < 0) {
          return { success: false, msg: "Cannot delete this transaction" };
        }

        await updateGuestWallet(walletId, wallet);
      }

      await deleteGuestTransaction(transactionId);
      return { success: true, msg: "Transaction deleted successfully" };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  } else {
    return supabaseDeleteTransaction(transactionId, walletId);
  }
};

export const getTransactionsAdapter = async (uid: string): Promise<TransactionType[]> => {
  const isGuest = await isGuestMode();

  if (isGuest) {
    return getGuestTransactions();
  } else {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("uid", uid)
      .order("date", { ascending: false });

    return data || [];
  }
};
