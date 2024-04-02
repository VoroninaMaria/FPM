import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  blur,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [phoneError, setPhoneError] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [phone, setPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [pinHidden, setPinHidden] = useState(true);

  const openRegister = () => {
    navigation.navigate("Register");
  };

  const openResetPassword = () => {
    navigation.navigate("ResetPassword");
  };

  const showPin = () => setPinHidden(!pinHidden);

  const loginHandler = () => {
    if (phoneError === false && pinError === false) {
      return axios
        .post(`${Config.baseUrl}/client/auth/login`, {
          password: pinCode,
          phone: phone,
          merchant: "gym1",
        })
        .then(async (res) =>
          AsyncStorage.setItem("token", res.data.token)
            .then(() =>
              axios
                .post(
                  `${Config.baseUrl}/client/graphql`,
                  {
                    query: "{self {first_name}}",
                    variables: {},
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${res.data.token}`,
                    },
                  }
                )
                .then((res) => {
                  const {
                    data: {
                      data: { self },
                    },
                  } = res;

                  if (self?.entity === 2) {
                    return navigation.navigate("LegalEntity", {
                      name: self?.first_name,
                    });
                  }

                  setPhone("");
                  setPinCode("");

                  return navigation.navigate("IntroductionScreen");
                })
                .catch((error) => {
                  console.log(error);
                  if (error.message.includes("status code 423")) {
                    return Alert.alert(
                      t("LoginScreen.Error"),
                      t("LoginScreen.Blocked")
                    );
                  }
                  if (error.message.includes("status code 403")) {
                    return Alert.alert(
                      t("LoginScreen.Error"),
                      t("LoginScreen.ErrorTXT")
                    );
                  }
                  return Alert.alert(t("LoginScreen.Error"), t("ErrorTXTDef"));
                })
            )
            .catch(() => {
              return Alert.alert(t("LoginScreen.Error"), t("ErrorTXTDef"));
            })
        )
        .catch((error) => {
          if (error.message.includes("status code 423")) {
            return Alert.alert(
              t("LoginScreen.Error"),
              t("LoginScreen.Blocked")
            );
          }
          if (error.message.includes("status code 403")) {
            return Alert.alert(
              t("LoginScreen.Error"),
              t("LoginScreen.ErrorTXT")
            );
          }
          return Alert.alert(t("LoginScreen.Error"), t("ErrorTXTDef"));
        });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerImg}>
          <Image
            source={require("../assets/images/gymLogo.png")}
            style={styles.logoLoginScreen}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.logo}>{t("LoginScreen.login")}</Text>
          <View style={[styles.inputView, phoneError && styles.inputError]}>
            <TextInput
              style={{ color: "black", width: "90%" }}
              placeholder={t("LoginScreen.number")}
              value={phone}
              maxLength={12}
              onChangeText={(text) => {
                if (text.startsWith("380") && text?.length === 12) {
                  setPhone(text);
                  return setPhoneError(false);
                }
                setPhone(text);
                return setPhoneError(true);
              }}
              placeholderTextColor="#222222"
              keyboardType="phone-pad"
            />
          </View>
          {phoneError && (
            <Text
              style={{
                color: "red",
                fontSize: 11,
                marginLeft: "1%",
              }}
            >
              {t("InputErrors.invalid_phone")}
            </Text>
          )}
          <View style={[styles.inputView, pinError && styles.inputError]}>
            <TextInput
              secureTextEntry={pinHidden}
              style={{ color: "black", width: "90%" }}
              placeholder={t("LoginScreen.pin")}
              value={pinCode}
              maxLength={6}
              onChangeText={(text) => {
                const textInputRegex = /^(?!\s).*/;

                if (textInputRegex.test(text) === false) {
                  setPinCode(text);
                  return setPinError(true);
                }
                setPinCode(text);
                return setPinError(false);
              }}
              placeholderTextColor="#222222"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.iconsInput} onPress={showPin}>
              <Icon
                name={pinHidden ? "eye-slash" : "eye"}
                size={17}
                color={pinHidden ? "#E2E2E2" : "#000000"}
              />
            </TouchableOpacity>
          </View>
          {pinError && (
            <Text style={{ color: "red", fontSize: 11, marginLeft: "1%" }}>
              {t("InputErrors.invalid_pin")}
            </Text>
          )}
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.loginBtn} onPress={loginHandler}>
            <Text style={styles.loginText}>{t("LoginScreen.loginBtn")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.registerText}>
          <Text
            style={{
              alignItems: "flex-end",
              fontSize: 12,
              fontWeight: "500",
              color: "rgba(100, 100, 100, 1)",
            }}
          >
            {t("LoginScreen.noAcc")}
          </Text>
          <TouchableOpacity style={styles.showPassword} onPress={openRegister}>
            <Text
              style={{
                alignItems: "flex-end",
                fontSize: 12,
                fontWeight: "500",
                color: "rgba(100, 100, 100, 1)",
                textDecorationLine: "underline",
              }}
            >
              {t("LoginScreen.register")}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[styles.registerText, { marginTop: "5%", marginLeft: "2%" }]}
        >
          <Text
            style={{
              alignItems: "flex-end",
              fontSize: 12,
              fontWeight: "500",
              color: "rgba(100, 100, 100, 1)",
            }}
          >
            Забули пароль?
          </Text>
          <TouchableOpacity
            style={styles.showPassword}
            onPress={openResetPassword}
          >
            <Text
              style={{
                alignItems: "flex-end",
                fontSize: 12,
                fontWeight: "500",
                color: "rgba(100, 100, 100, 1)",
                textDecorationLine: "underline",
              }}
            >
              Відновити пароль
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  containerImg: {
    resizeMode: "contain",
    top: 20,
    right: 10,
    left: 0,
    paddingHorizontal: 20,
    padding: 10,
  },
  logoLoginScreen: {
    width: 220,
    height: 90,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 20,
    color: "black",
    top: "10%",
    marginBottom: "15%",
    textAlign: "center",
  },
  inputView: {
    width: "100%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    height: 60,
    marginBottom: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginTop: "1%",
  },
  inputText: {
    width: "90%",
    height: 40,
    color: "white",
  },
  inputContainer: {
    marginTop: "20%",
    width: "90%",
  },
  iconsInput: {
    marginRight: 10,
  },
  loginBtn: {
    width: 135,
    backgroundColor: "#f2cb84",
    borderRadius: 6,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 3,
    borderColor: "#e6ab00",
    borderWidth: 0.75,
    marginTop: "8%",
    shadowColor: "rgba(246,199,112,0.26514355742296913)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  btnContainer: {
    flexDirection: "row",
  },
  loginText: {
    fontFamily: "Raleway",
    color: "black",
    fontSize: 14,
    fontWeight: "600",
  },
  lineStyle: {
    borderWidth: 1,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "80%",
    margin: 10,
    marginTop: "6%",
  },
  registerText: {
    flexDirection: "row",
  },
  inputText: {
    fontFamily: "Raleway",
  },
  inputError: {
    borderColor: "red",
  },
});
