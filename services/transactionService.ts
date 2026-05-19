import { ResponseType, TransactionType, WalletType } from "@/types";
import { uploadFileToCloudinary } from "./imageService";
import { supabase } from "@/config/supabase";
import { createOrUpdateWallet } from "./walletService";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";
import {
  isGuestMode,
  getGuestTransactions,
  getGuestWallet,
  updateGuestWallet,
  addGuestTransaction,
  updateGuestTransaction,
} from "./localStorageService";

export const createOrUpdateTransaction = async (transactionData: Partial<TransactionType>) => {
  try {
    const { id, type, amount, walletId, image } = transactionData;

    if (!amount || amount <= 0 || !walletId || !type) {
      return {
        success: false,
        msg: "Invalid transaction data!",
      };
    }

    // Check guest mode
    const guestMode = await isGuestMode();

    // do this while updating: Fetch the original transaction if updating
    if (id) {
      // Fetch the old transaction data
      let oldTransaction: TransactionType | null = null;

      if (guestMode) {
        // Fetch from local storage
        const transactions = await getGuestTransactions();
        oldTransaction = transactions.find((t) => t.id === id) || null;
      } else {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          return { success: false, msg: "Transaction not found" };
        }
        oldTransaction = data;
      }

      if (!oldTransaction) {
        return { success: false, msg: "Transaction not found" };
      }

      const shouldRevertOriginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;

      if (shouldRevertOriginal) {
        // Check if we need to revert the original transaction (type, amount, or wallet changed)
        let res = await revertAndUpdateWallets(
          oldTransaction, // Old transaction
          Number(amount!), // New transaction amount
          type, // New transaction type ('income' or 'expense')
          walletId!, // New wallet ID
        );

        if (!res.success) return res;
      }
    } else {
      // Handle wallet updates for new transactions
      let res = await updateWalletForNewTransaction(walletId!, Number(amount!), type);
      if (!res.success) return res;
    }

    // Upload image if provided
    if (image) {
      const imageUploadResponse = await uploadFileToCloudinary(image, "transactions");
      if (!imageUploadResponse.success) {
        return {
          success: false,
          msg: imageUploadResponse.msg || "Failed to upload image",
        };
      }
      transactionData.image = imageUploadResponse.data;
    }

    // Create or update the transaction
    let result;

    if (guestMode) {
      // Guest mode: save to local storage
      if (id) {
        // Update existing transaction
        result = await updateGuestTransaction(id, transactionData);
        if (!result) {
          return { success: false, msg: "Transaction not found" };
        }
      } else {
        // Create new transaction
        result = await addGuestTransaction(transactionData as TransactionType);
      }
    } else {
      // Supabase mode
      if (id) {
        // Update existing transaction
        const { data, error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new transaction
        const { data, error } = await supabase
          .from("transactions")
          .insert(transactionData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating or updating transaction:", error);
    return { success: false, msg: error.message };
  }
};

export const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string,
) => {
  try {
    const guestMode = await isGuestMode();
    let walletData: WalletType | null = null;

    if (guestMode) {
      // Fetch wallet from local storage
      walletData = await getGuestWallet(walletId);
    } else {
      // Fetch the wallet from Supabase
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", walletId)
        .single();

      if (error) {
        console.error("Wallet not found");
        return { success: false, msg: "Wallet not found!" };
      }
      walletData = data as WalletType;
    }

    if (!walletData) {
      console.error("Wallet not found");
      return { success: false, msg: "Wallet not found!" };
    }

    if (type == "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet don't have enough balance",
      };
    }

    // Adjust wallet balance and totals based on the transaction type
    const updatedWalletAmount =
      type === "income"
        ? Number(walletData.amount!) + amount // Add income to wallet balance
        : Number(walletData.amount!) - amount; // Subtract expense from wallet balance

    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedTotals =
      type === "income"
        ? Number(walletData.totalIncome!) + amount
        : Number(walletData.totalExpenses!) + amount;

    // Update the wallet
    if (guestMode) {
      // Update wallet in local storage
      await updateGuestWallet(walletId, {
        amount: updatedWalletAmount,
        [updateType]: updatedTotals,
      });
    } else {
      // Update wallet in Supabase
      const { error: updateError } = await supabase
        .from("wallets")
        .update({
          amount: updatedWalletAmount,
          [updateType]: updatedTotals,
        })
        .eq("id", walletId);

      if (updateError) throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating wallet for new transaction:", error);
    return { success: false, msg: "Could not update the wallet!" };
  }
};

export const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string,
) => {
  try {
    // Fetch the original wallet data before updating the amounts
    const { data: originalWallet, error: origError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", oldTransaction.walletId)
      .single();

    if (origError || !originalWallet) {
      return { success: false, msg: "Original wallet not found!" };
    }

    // Fetch the new wallet data
    const { data: newWallet, error: newError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", newWalletId)
      .single();

    if (newError || !newWallet) {
      return { success: false, msg: "New wallet not found!" };
    }

    // console.log("original transaction type: ", oldTransaction?.type);
    // console.log("original wallet amount: ", originalWallet?.amount);
    // console.log("original wallet totalIncome: ", originalWallet.totalIncome);
    // console.log(
    //   "original wallet totalExpenses: ",
    //   originalWallet.totalExpenses
    // );
    // console.log("--------------------------->");

    const revertType = oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

    // Revert the previous transaction's effect on wallet balance and income/expense totals
    // the amount that we need to add or subtract
    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount!) // Subtract income from wallet balance
        : Number(oldTransaction.amount!); // Add back expense to wallet balance

    const revertedWalletAmount = Number(originalWallet.amount!) + Number(revertIncomeExpense);

    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]!) - Number(oldTransaction.amount!);

    // console.log("new transaction type: ", newTransactionType);
    // console.log("reverted wallet amount: ", revertedWalletAmount);
    // console.log(
    //   "reverted wallet total income/expenses: ",
    //   revertedIncomeExpenseAmount
    // );
    // console.log("revert type: ", revertType);
    // console.log("------------------------------------>");

    // check if the user is trying to conver the income to expense on the same wallet

    if (newTransactionType == "expense") {
      // if the user tries to convert the income to expense on the same wallet
      // or if the user tries to increase the expense amount and don't have anough balance on the same amount
      if (oldTransaction.walletId == newWalletId && revertedWalletAmount < newTransactionAmount) {
        console.log(
          "same wallet, the wallet balance after transaction: ",
          revertedWalletAmount - newTransactionAmount,
        );
        return {
          success: false,
          msg: "The selected wallet don't have enough balance!",
        };
      }

      // if user tries to add expense from a new wallet but the new wallet don't have enough balance
      if (newWallet.amount! < newTransactionAmount) {
        console.log(
          "new wallet amount after transaction: ",
          newWallet.amount! - newTransactionAmount,
        );
        return {
          success: false,
          msg: "The selected wallet don't have enough balance!",
        };
      }
    }

    // Update the original wallet
    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    ////////////////////////////////////////////////////////////////////////////

    // the new wallet could be the same wallet and we will need the updated wallet amounts
    // so we will need to refetch the wallet
    const { data: refetchedWallet, error: refetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", newWalletId)
      .single();

    if (refetchError || !refetchedWallet) {
      return { success: false, msg: "Could not refetch wallet!" };
    }

    const newWallet2 = refetchedWallet;

    // Apply the new transaction to the new wallet
    const updateType = newTransactionType == "income" ? "totalIncome" : "totalExpenses";
    const updateWalletAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount) // Add income to wallet balance
        : -Number(newTransactionAmount); // Subtract expense from wallet balance

    const newWalletAmount = Number(newWallet2.amount!) + updateWalletAmount;

    const newIncomeExpenseAmount = Number(newWallet2[updateType]!) + Number(newTransactionAmount);

    // console.log("new transaction type: ", newTransactionType);
    // console.log("updated wallet amount: ", updateWalletAmount);
    // console.log(
    //   "updated wallet total income/expenses: ",
    //   newIncomeExpenseAmount
    // );
    // console.log("update type: ", updateType);

    // Update the new wallet
    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating wallets:", error);
    // You can log or handle the error as needed here
    return { success: false, msg: "Could not update the wallet!" };
  }
};

export const deleteTransaction = async (transactionId: string, walletId: string) => {
  try {
    // Step 1: Fetch the transaction to retrieve its details
    const { data: transactionData, error: transError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (transError || !transactionData) {
      return { success: false, msg: "Transaction not found" };
    }

    const transactionType = transactionData.type;
    const transactionAmount = Number(transactionData.amount);

    // Step 2: Fetch the wallet data to update the totalIncome or totalExpenses
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", walletId)
      .single();

    if (walletError || !walletData) {
      return { success: false, msg: "Wallet not found" };
    }

    // Determine the field to update based on transaction type
    const updateType = transactionType === "income" ? "totalIncome" : "totalExpenses";
    const newWalletAmount =
      walletData?.amount! - (transactionType === "income" ? transactionAmount : -transactionAmount);
    const updatedTotals = walletData[updateType] - transactionAmount;

    // if its income and the wallet amount can go below zero
    if (transactionType == "income" && newWalletAmount < 0) {
      return { success: false, msg: "You cannot delete this transaction" };
    }

    // Step 3: Update the wallet with the new totals
    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: updatedTotals,
    });

    // Step 4: Delete the transaction from database
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (deleteError) throw deleteError;

    return { success: true, msg: "Transaction deleted and wallet updated" };
  } catch (error) {
    console.error("Error deleting transaction and updating wallet:", error);
    return {
      success: false,
      msg: "Failed to delete transaction or update wallet",
    };
  }
};

/// statistics

export const fetchWeeklyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Fetch transactions based on mode
    let allTransactions: TransactionType[] = [];
    const guestMode = await isGuestMode();

    if (guestMode) {
      allTransactions = await getGuestTransactions();
    } else {
      const { data, error } = await supabase.from("transactions").select("*").eq("uid", uid);

      if (error) throw error;
      allTransactions = (data || []) as TransactionType[];
    }

    // Filter transactions for the last 7 days
    const queryData = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= sevenDaysAgo && transactionDate <= today;
    });

    // Sort by date descending
    queryData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    // Map transactions to the correct day in weeklyData and build the transactions array
    (queryData || []).forEach((transaction) => {
      transactions.push(transaction as TransactionType);

      const transactionDate = new Date(transaction.date).toISOString().split("T")[0];
      const dayData = weeklyData.find((day) => day.date === transactionDate);

      if (dayData) {
        if (transaction.type === "income") dayData.income += transaction.amount;
        else if (transaction.type === "expense") dayData.expense += transaction.amount;
      }
    });

    // flatMap takes each day’s data and creates two entries
    // — one for income and one for expense
    // — then flattens these entries into a single array
    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      {
        value: day.expense,
        frontColor: colors.rose,
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching weekly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch weekly transactions",
    };
  }
};

export const fetchMonthlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    // Fetch transactions based on mode
    let allTransactions: TransactionType[] = [];
    const guestMode = await isGuestMode();

    if (guestMode) {
      allTransactions = await getGuestTransactions();
    } else {
      const { data, error } = await supabase.from("transactions").select("*").eq("uid", uid);

      if (error) throw error;
      allTransactions = (data || []) as TransactionType[];
    }

    // Filter transactions for the last 12 months
    const queryData = allTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= twelveMonthsAgo && transactionDate <= today;
    });

    // Sort by date descending
    queryData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // Process transactions to calculate income and expense for each month
    (queryData || []).forEach((transaction) => {
      transactions.push(transaction as TransactionType);

      const transactionDate = new Date(transaction.date);
      const monthName = transactionDate.toLocaleString("default", {
        month: "short",
      });
      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find((month) => month.month === `${monthName} ${shortYear}`);

      if (monthData) {
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expense += transaction.amount;
        }
      }
    });

    // Reformat monthlyData for the bar chart with income and expense entries for each month
    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(46),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: month.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching monthly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch monthly transactions",
    };
  }
};

export const fetchYearlyStats = async (uid: string): Promise<ResponseType> => {
  try {
    // Check if in guest mode
    const guestMode = await isGuestMode();
    let queryData: TransactionType[] = [];

    if (guestMode) {
      // Fetch from local storage
      queryData = await getGuestTransactions();
      // Sort by date descending
      queryData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      // Fetch all transactions for the specified user from Supabase
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("uid", uid)
        .order("date", { ascending: false });

      if (error) throw error;
      queryData = data || [];
    }

    const transactions: TransactionType[] = [];

    // Find the first and last year from transactions
    const firstTransaction = (queryData || []).reduce((earliest, transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate < earliest ? transactionDate : earliest;
    }, new Date());

    const firstYear = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();

    // Initialize yearly data range
    const yearlyData = getYearsRange(firstYear, currentYear);

    // Process transactions to calculate income and expense for each year
    (queryData || []).forEach((transaction) => {
      transactions.push(transaction as TransactionType);

      const transactionYear = new Date(transaction.date).getFullYear();
      const yearData = yearlyData.find((item: any) => item.year === transactionYear.toString());

      if (yearData) {
        if (transaction.type === "income") {
          yearData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          yearData.expense += transaction.amount;
        }
      }
    });

    // Reformat yearlyData for the bar chart with income and expense entries for each year
    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary, // Income bar color
      },
      {
        value: year.expense,
        frontColor: colors.rose, // Expense bar color
      },
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions, // Include all transaction details
      },
    };
  } catch (error) {
    console.error("Error fetching yearly transactions:", error);
    return {
      success: false,
      msg: "Failed to fetch yearly transactions",
    };
  }
};
