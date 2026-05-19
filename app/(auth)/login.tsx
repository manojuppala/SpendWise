import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { scale, verticalScale } from "@/utils/styling";
import { colors, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import * as Icons from "phosphor-react-native";
import { useAuth } from "@/contexts/authContext";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { login, guestLogin } = useAuth();

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "please fill all the fields!");
      return;
    }
    setLoading(true);
    const res = await login(emailRef.current, passwordRef.current);
    setLoading(false);
    if (!res.success) {
      Alert.alert("Login", res.msg);
    }
  };

  const onGuestLogin = async () => {
    setGuestLoading(true);
    const res = await guestLogin();
    setGuestLoading(false);
    if (!res.success) {
      Alert.alert("Guest Login", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <View style={styles.container}>
        <BackButton iconSize={28} />
        {/* welcome */}
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Hey,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Welcome Back
          </Typo>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Login now to track all your expenses
          </Typo>
          <Input
            icon={
              <Icons.At
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={
              <Icons.Lock
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
            Forgot Password?
          </Typo>
          {/* button */}
          <Button loading={loading} onPress={onSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              Login
            </Typo>
          </Button>

          {/* Guest Login Button */}
          <Button
            loading={guestLoading}
            onPress={onGuestLogin}
            style={styles.guestButton}
          >
            <Icons.User
              size={verticalScale(24)}
              color={colors.primary}
              weight="bold"
            />
            <Typo fontWeight={"700"} color={colors.primary} size={18}>
              Continue as Guest
            </Typo>
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Typo size={13} color={colors.textLight}>
              Guest mode stores data locally on your device
            </Typo>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Typo size={15}>Dont't have an account?</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/register")}>
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              Sign up
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    gap: scale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacingY._10,
    marginVertical: spacingY._10,
  },
  dividerLine: {
    height: 1,
    width: "100%",
    backgroundColor: colors.neutral800,
  },
});
