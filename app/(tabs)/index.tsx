import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { StatusBar } from "expo-status-bar";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { scale, verticalScale } from "@/utils/styling";
import HomeCard from "@/components/HomeCard";
import Button from "@/components/Button";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/authContext";
import { Router, useRouter } from "expo-router";
import TransactionList from "@/components/TransactionList";
import useFetchData from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import { fetchWeeklyStats } from "@/services/transactionService";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Use the useFetchData hook with the 'transactions' table
  const {
    data: allTransactions,
    loading: transactionsLoading,
    error,
  } = useFetchData<TransactionType>("transactions", {
    uid: user?.uid,
    orderBy: { column: "date", ascending: false },
  });

  // Limit to 30 recent transactions
  const recentTransactions = allTransactions.slice(0, 30);

  const logout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello,
            </Typo>
            <Typo fontWeight={"500"} size={20}>
              {user?.name || " "}
            </Typo>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(modals)/searchModal")}
            style={styles.searchIcon}
          >
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={colors.neutral200}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* card */}
          <View>
            <HomeCard />
          </View>

          <TransactionList
            title={"Recent Transactions"}
            loading={transactionsLoading}
            data={recentTransactions}
            emptyListMessage="No Transactions added yet!"
          />

          {/* <Button onPress={logout}>
            <Typo color={colors.black}>Logout</Typo>
          </Button> */}
        </ScrollView>
        <Button
          onPress={() => router.push("/(modals)/transactionModal")}
          style={styles.floatingButton}
        >
          <Icons.Plus
            color={colors.black}
            weight="bold"
            size={verticalScale(24)}
          />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },

  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
});
