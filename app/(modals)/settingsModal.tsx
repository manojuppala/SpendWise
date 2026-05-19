import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Button from "@/components/Button";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import BackButton from "@/components/BackButton";
import { Dropdown } from "react-native-element-dropdown";
import {
  getCurrencySymbol,
  setCurrencySymbol,
  CURRENCY_SYMBOLS,
} from "@/services/settingsService";

const SettingsModal = () => {
  const router = useRouter();
  const [currencySymbol, setCurrency] = useState("$");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const symbol = await getCurrencySymbol();
    setCurrency(symbol);
  };

  const onSave = async () => {
    if (loading) return;
    setLoading(true);

    await setCurrencySymbol(currencySymbol);

    setLoading(false);
    Alert.alert(
      "Settings Saved",
      "Your currency preference has been saved successfully!",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Settings"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16} fontWeight={"500"}>
              Currency Symbol
            </Typo>
            <Typo color={colors.neutral400} size={14} style={{ marginTop: 4 }}>
              Select the currency symbol to display throughout the app
            </Typo>
            <Dropdown
              style={styles.dropdownContainer}
              activeColor={colors.neutral700}
              itemTextStyle={styles.dropdownItemText}
              selectedTextStyle={styles.dropdownSelectedText}
              itemContainerStyle={styles.dropdownItemContainer}
              iconStyle={styles.dropdownIcon}
              data={CURRENCY_SYMBOLS}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholderStyle={styles.dropdownPlaceholder}
              value={currencySymbol}
              containerStyle={styles.dropdownListContainer}
              onChange={(item) => {
                setCurrency(item.value);
              }}
            />
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={onSave} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"} size={18}>
            Save Settings
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._25,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  dropdownContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  dropdownItemText: {
    color: colors.white,
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: 16,
  },
  dropdownItemContainer: {
    backgroundColor: colors.neutral800,
  },
  dropdownIcon: {
    tintColor: colors.white,
  },
  dropdownPlaceholder: {
    color: colors.neutral400,
    fontSize: 16,
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._10,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
});
