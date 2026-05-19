import { uploadFileToCloudinary } from "./imageService";
import { ResponseType, WalletType } from "@/types";
import { supabase } from "@/config/supabase";

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>,
): Promise<ResponseType> => {
  try {
    // upload image

    let walletToSave = { ...walletData };

    if (walletData.image) {
      const imageUploadResponse = await uploadFileToCloudinary(walletData.image, "wallets");

      if (!imageUploadResponse.success) {
        return {
          success: false,
          msg: imageUploadResponse.msg || "Failed to upload image",
        };
      }

      walletToSave.image = imageUploadResponse.data;
    }

    if (!walletData.id) {
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date().toISOString();
    }

    let result;
    if (walletData.id) {
      // Update existing wallet
      const { data, error } = await supabase
        .from("wallets")
        .update(walletToSave)
        .eq("id", walletData.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new wallet
      const { data, error } = await supabase.from("wallets").insert(walletToSave).select().single();

      if (error) throw error;
      result = data;
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating or updating wallet:", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const { error } = await supabase.from("wallets").delete().eq("id", walletId);

    if (error) throw error;

    // Delete associated transactions
    await deleteTransactionsByWalletId(walletId);

    return {
      success: true,
      msg: "Wallet deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting wallet:", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};

export const deleteTransactionsByWalletId = async (walletId: string): Promise<ResponseType> => {
  try {
    // Delete all transactions associated with the wallet
    const { error } = await supabase.from("transactions").delete().eq("walletId", walletId);

    if (error) throw error;

    return {
      success: true,
      msg: "All transactions deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting transactions:", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};
