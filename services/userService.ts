import { supabase } from "@/config/supabase";
import { ResponseType, UserDataType } from "@/types";
import { uploadFileToCloudinary } from "./imageService";

export const updateUser = async (uid: string, updatedData: UserDataType): Promise<ResponseType> => {
  try {
    if (updatedData.image && updatedData?.image?.uri) {
      const imageUploadResponse = await uploadFileToCloudinary(updatedData.image, "users");

      if (!imageUploadResponse.success) {
        return {
          success: false,
          msg: imageUploadResponse.msg || "Failed to upload image",
        };
      }

      updatedData.image = imageUploadResponse.data;
    }

    // Update the user document with the provided updatedData
    const { data, error } = await supabase
      .from("users")
      .update(updatedData)
      .eq("id", uid)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        msg: error.message,
      };
    }

    return {
      success: true,
      msg: "Updated successfully",
      data,
    };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return {
      success: false,
      msg: error.message,
    };
  }
};
