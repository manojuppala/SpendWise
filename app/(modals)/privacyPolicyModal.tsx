import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import { colors, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";

const PrivacyPolicyModal = () => {
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Privacy Policy"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Typo size={14} color={colors.neutral300} style={styles.lastUpdated}>
            Last Updated: {new Date().toLocaleDateString()}
          </Typo>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              1. Introduction
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              Welcome to SpendWise. This Privacy Policy explains how we
              collect, use, and protect your information when you use our
              application.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              2. Information We Collect
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • Account information (name, email) if you create an account
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • Transaction data (amounts, categories, dates, descriptions)
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • Wallet information and balances
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • Images you upload for wallets or transactions
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              3. Guest Mode
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              If you use Guest Mode, all your data is stored locally on your
              device using AsyncStorage. This data is not transmitted to our
              servers and remains completely private on your device.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              4. How We Use Your Information
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • To provide expense tracking functionality
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • To generate statistics and insights about your spending
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • To sync your data across devices (if logged in)
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              • To improve our services
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              5. Data Security
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              We take reasonable measures to protect your information from
              unauthorized access, alteration, or disclosure. However, no method
              of transmission over the internet is 100% secure.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              6. Third-Party Services
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              We use third-party services for authentication (Supabase) and
              image storage (Cloudinary). These services have their own privacy
              policies governing the use of your information.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              7. Your Rights
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              You have the right to access, update, or delete your personal
              information at any time. In Guest Mode, you can clear all data
              from your device settings.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              8. Changes to This Policy
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by updating the "Last Updated" date at
              the top of this policy.
            </Typo>
          </View>

          <View style={styles.section}>
            <Typo size={18} fontWeight="600" style={styles.sectionTitle}>
              9. Contact Us
            </Typo>
            <Typo size={15} color={colors.neutral300} style={styles.paragraph}>
              If you have any questions about this Privacy Policy, please
              contact us through the app's support section.
            </Typo>
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default PrivacyPolicyModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  content: {
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  lastUpdated: {
    marginBottom: spacingY._20,
    fontStyle: "italic",
  },
  section: {
    marginBottom: spacingY._25,
  },
  sectionTitle: {
    marginBottom: spacingY._10,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: spacingY._8,
  },
});
