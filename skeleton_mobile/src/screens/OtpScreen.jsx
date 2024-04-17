import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OtpScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [secondSecret, setSecondSecret] = useState("");

  const [enableResend, setEnableResend] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const { secret, phone } = route.params;

  useEffect(() => {
    if (secret) {
      setSecondSecret(secret);
    }
  }, []);

  let clockCall = null;

  const formatTime = (d) => {
    const minutes = Math.floor(d / 60);
    const seconds = d % 60;
    const timeString =
      minutes.toString() + ":" + seconds.toString().padStart(2, "0");

    return timeString;
  };

  useEffect(() => {
    clockCall = setInterval(() => {
      decrementClock();
    }, 1000);

    return () => {
      clearInterval(clockCall);
    };
  }, clockCall);

  const decrementClock = () => {
    if (countdown === 0) {
      setEnableResend(true);
      clearInterval(clockCall);
    } else {
      setCountdown(countdown - 1);
    }
  };

  const confirmHandler = () =>
    axios
      .post(`${Config.baseUrl}/client/auth/confirm`, {
        code: code,
        secret: secondSecret,
      })
      .then(async (res) =>
        AsyncStorage.setItem("token", res.data.token)
          .then(() =>
            axios
              .post(
                `${Config.baseUrl}/client/graphql`,
                {
                  query: "{self {id, first_name}}",
                  variables: {},
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${res.data.token}`,
                  },
                }
              )
              .then((result) => {
                const {
                  data: {
                    data: { self },
                  },
                } = result;

                return navigation.navigate("Confirmation", {
                  name: self?.first_name,
                });
              })
              .catch(() => {
                return Alert.alert(
                  t("LoginScreen.Error"),
                  t("LoginScreen.ErrorTXT")
                );
              })
          )
          .catch((error) => {
            if (error.message.includes("status code 403")) {
              return Alert.alert(
                "Error",
                "Pin-code incorrect. Please check your information and try again later."
              );
            }
            return Alert.alert(
              t("LoginScreen.Error"),
              t("LoginScreen.ErrorTXT")
            );
          })
      )
      .catch((error) => {
        if (error.message.includes("status code 403")) {
          return Alert.alert(t("OTPScreen.Error"), t("OTPScreen.errorPin"));
        }
        return Alert.alert(t("LoginScreen.Error"), t("LoginScreen.ErrorTXT"));
      });

  const resetOtp = () =>
    axios
      .post(`${Config.baseUrl}/client/auth/resend_password`, {
        phone: phone,
        merchant: "Mango",
      })
      .then(async (res) => {
        return setSecondSecret(res.data.secret);
      })
      .catch((error) => {
        if (error.message.includes("status code 403")) {
          return Alert.alert(t("OTPScreen.Error"), t("OTPScreen.errorPin"));
        }
        return Alert.alert(
          "Error",
          "Something went wrong. Please try again later"
        );
      });

  const onResendOTP = () => {
    if (enableResend) {
      setCountdown(120);
      setEnableResend(false);
      clearInterval(clockCall);
      clockCall = setInterval(() => {
        decrementClock();
      }, 1000);
      resetOtp();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerImg}>
          <Image
            source={require("../assets/images/Sports.png")}
            style={styles.logoLoginScreen}
          />
        </View>
        <View style={styles.TextRegister}>
          <Text style={styles.textRegistration}>{t("OTPScreen.otp")}</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder={t("OTPScreen.pin")}
              value={code}
              maxLength={6}
              onChangeText={(text) => setCode(text)}
              placeholderTextColor="#222222"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.loginBtn} onPress={confirmHandler}>
            <Text style={styles.loginText}>{t("OTPScreen.confirm")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendBtn} onPress={onResendOTP}>
            <Text
              style={[
                styles.loginText,
                {
                  color: enableResend ? "#18AA5E" : "#008080",
                  fontFamily: "Raleway",
                },
              ]}
            >
              {t("OTPScreen.send")} ({formatTime(countdown)})
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineStyle} />
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  containerImg: {
    resizeMode: "contain",
    top: 64,
    right: 10,
    left: 0,
    paddingHorizontal: 20,
    padding: 10,
  },
  logoLoginScreen: {
    width: 300,
    height: 40,
  },
  textRegistration: {
    fontWeight: "700",
    fontSize: 21,
    color: "black",
    top: 48,
    fontFamily: "Raleway",
  },
  inputView: {
    color: "black",
    width: "100%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    height: "23%",
    marginBottom: 5,
    justifyContent: "center",
    marginTop: "12%",
  },
  inputText: {
    height: "100%",
    fontSize: 13,
    fontFamily: "Raleway",
    marginLeft: "2%",
    color: "black",
    fontWeight: "500",
  },
  TextRegister: {
    alignItems: "center",
    top: "5%",
    width: "90%",
    color: "black",
  },
  inputContainer: {
    top: "10%",
    width: "90%",
    alignItems: "center",
    color: "black",
  },
  loginBtn: {
    width: 263,
    backgroundColor: "rgba(24, 170, 94, 1)",
    borderRadius: 6,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    borderColor: "#00FF7F",
    borderWidth: 0.75,
    top: "22%",
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  resendBtn: {
    width: 263,
    backgroundColor: "white",
    borderRadius: 6,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    borderColor: "#00FF7F",
    borderWidth: 0.75,
    top: "22%",
  },

  btnContainer: {
    flexDirection: "column",
  },
  loginText: {
    fontFamily: "Raleway",
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  lineStyle: {
    borderWidth: 0.7,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "80%",
    margin: 10,
    top: "16%",
  },
  registerText: { flexDirection: "row", top: "33%" },
});
