import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import Loading from "@/components/Loading";
import { StyleSheet, View, Animated } from "react-native";
import { colors, spacingY } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import Typo from "@/components/Typo";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";

const SplashScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication state
    const timer = setTimeout(() => {
      if (user) {
        // User is authenticated (guest or regular), go to home
        router.replace("/(tabs)");
      } else {
        // Not authenticated, go to welcome screen
        router.replace("/welcome");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <Icons.Wallet
              size={verticalScale(80)}
              color={colors.primary}
              weight="fill"
            />
          </View>
        </View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Typo size={42} fontWeight="800" color={colors.white}>
            SpendWise
          </Typo>
          <Typo size={16} color={colors.neutral400} style={styles.tagline}>
            Track Every Penny
          </Typo>
        </Animated.View>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Loading />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral900,
    gap: 40,
  },
  content: {
    alignItems: "center",
    gap: spacingY._30,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: verticalScale(120),
    height: verticalScale(120),
    borderRadius: verticalScale(60),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  titleContainer: {
    alignItems: "center",
    gap: 8,
  },
  tagline: {
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default SplashScreen;
