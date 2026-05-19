import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, UserType } from "@/types";
import { supabase } from "@/config/supabase";
import { Router, useRouter, useSegments } from "expo-router";
import { Session } from "@supabase/supabase-js";
import {
  setGuestMode,
  isGuestMode,
  setGuestUser,
  getGuestUser,
  clearGuestData,
  getAllGuestData,
} from "@/services/localStorageService";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>(null);
  const router: Router = useRouter();

  useEffect(() => {
    // Check for existing session (guest or authenticated)
    const initializeAuth = async () => {
      // First check if in guest mode
      const guestMode = await isGuestMode();

      if (guestMode) {
        const guestUser = await getGuestUser();
        if (guestUser) {
          setUser(guestUser);
          router.replace("/(tabs)");
          return;
        }
      }

      // Check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || null,
        });
        updateUserData(session.user.id);
        router.replace("/(tabs)");
      } else {
        setUser(null);
        router.replace("/(auth)/welcome");
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // If user was in guest mode, migrate their data
          const guestMode = await isGuestMode();
          if (guestMode) {
            await migrateGuestDataToSupabase(session.user.id);
          }

          setUser({
            uid: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || null,
          });
          updateUserData(session.user.id);
          router.replace("/(tabs)");
        } else {
          setUser(null);
          router.replace("/(auth)/welcome");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes("Invalid login credentials")) msg = "Wrong credentials";
        if (msg.includes("invalid email")) msg = "Invalid email";
        return { success: false, msg };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes("invalid email")) msg = "Invalid email";
        if (msg.includes("already registered")) msg = "This email is already in use";
        return { success: false, msg };
      }

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            email,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  const guestLogin = async () => {
    try {
      const guestUser: UserType = {
        uid: 'guest',
        email: null,
        name: 'Guest User',
        image: null,
      };

      await setGuestMode(true);
      await setGuestUser(guestUser);
      setUser(guestUser);
      router.replace("/(tabs)");
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  };

  const migrateGuestDataToSupabase = async (newUserId: string) => {
    try {
      const guestData = await getAllGuestData();

      // Migrate wallets
      if (guestData.wallets && guestData.wallets.length > 0) {
        const walletsToMigrate = guestData.wallets.map(wallet => ({
          ...wallet,
          uid: newUserId,
          id: undefined, // Let Supabase generate new IDs
        }));

        const { error: walletsError } = await supabase
          .from('wallets')
          .insert(walletsToMigrate);

        if (walletsError) {
          console.error('Error migrating wallets:', walletsError);
        }
      }

      // Migrate transactions
      if (guestData.transactions && guestData.transactions.length > 0) {
        const transactionsToMigrate = guestData.transactions.map(transaction => ({
          ...transaction,
          uid: newUserId,
          id: undefined, // Let Supabase generate new IDs
        }));

        const { error: transactionsError } = await supabase
          .from('transactions')
          .insert(transactionsToMigrate);

        if (transactionsError) {
          console.error('Error migrating transactions:', transactionsError);
        }
      }

      // Clear guest data after successful migration
      await clearGuestData();
      console.log('Guest data migrated successfully');
    } catch (error) {
      console.error('Error migrating guest data:', error);
    }
  };

  const updateUserData = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error("Error fetching user data: ", error);
        return;
      }

      if (data) {
        const userData: UserType = {
          uid: data.id,
          email: data.email || null,
          name: data.name || null,
          image: data.image || null,
        };
        setUser({ ...user, ...userData });
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
    guestLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }
  return context;
};
