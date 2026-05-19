import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/config/supabase";
import { isGuestMode, getGuestWallets, getGuestTransactions } from "@/services/localStorageService";
import { useFocusEffect } from "expo-router";

type QueryOptions = {
  uid?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: { [key: string]: any };
};

const useFetchData = <T>(tableName: string, options: QueryOptions = {}) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!tableName) return;

    try {
      setLoading(true);

      // Check if in guest mode
      const guestMode = await isGuestMode();

      if (guestMode) {
        // Fetch from local storage
        let localData: any[] = [];

        if (tableName === "wallets") {
          localData = await getGuestWallets();
        } else if (tableName === "transactions") {
          localData = await getGuestTransactions();
        }

        setData(localData as T[]);
        setLoading(false);
      } else {
        // Fetch from Supabase with real-time subscription
        let query = supabase.from(tableName).select("*");

        // Apply filters
        if (options.uid) {
          query = query.eq("uid", options.uid);
        }

        if (options.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        // Apply ordering
        if (options.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? false,
          });
        }

        // Initial fetch
        const { data: initialData, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setData((initialData || []) as T[]);
        setLoading(false);

        // Note: Real-time subscriptions removed from callback, will be set up in useEffect
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [tableName, options.uid, JSON.stringify(options.filters), JSON.stringify(options.orderBy)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Refresh data when screen comes into focus (for Guest Mode)
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, []),
  );

  return { data, loading, error };
};

export default useFetchData;
