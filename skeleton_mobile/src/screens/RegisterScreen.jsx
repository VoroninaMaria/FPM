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
} from "react-native";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";

const RegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const { t } = useTranslation();
  const openLogin = () => {
    navigation.navigate("Login");
  };

  const registerHandler = () => {
    if (
      phoneError === false &&
      firstNameError === false &&
      lastNameError === false
    ) {
      return axios
        .post(`${Config.baseUrl}/client/auth/register`, {
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          merchant: "Mango",
        })
        .then(async (res) => {
          if (res.status === 200) {
            return navigation.navigate("OTPScreen", {
              secret: res.data.secret,
              phone: phone,
              lastName: lastName,
              firstName: firstName,
            });
          }
        })
        .catch((error) => {
          if (error.message.includes("status code 406")) {
            return Alert.alert(
              t("RegisterScreen.Error"),
              t("RegisterScreen.ErrorTXTs")
            );
          }
          if (error.message.includes("status code 403")) {
            return Alert.alert(
              t("RegisterScreen.Error"),
              t("RegisterScreen.ErrorTXT")
            );
          }
          return Alert.alert(t("RegisterScreen.Error"), t("ErrorTXTDef"));
        });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerImg}>
          <Image
            source={require("../assets/images/horizontal_transp.png")}
            style={styles.logoLoginScreen}
          />
        </View>
        <View style={styles.TextRegister}>
          <Text style={styles.textRegistration}>
            {t("RegisterScreen.register")}
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={[styles.inputView, firstNameError && styles.inputError]}>
            <TextInput
              style={{ color: "black", fontSize: 12 }}
              placeholder={t("RegisterScreen.firstName")}
              placeholderTextColor="#222222"
              value={firstName}
              maxLength={36}
              onChangeText={(text) => {
                const textInputRegex = /^(?!\s).*/;

                if (text.length === 0 && textInputRegex.test(text) === false) {
                  setFirstName(text);
                  return setFirstNameError(true);
                }
                setFirstName(text);
                return setFirstNameError(false);
              }}
              keyboardType="default"
            />
          </View>
          {firstNameError && (
            <Text style={{ color: "red", fontSize: 10, marginLeft: "1%" }}>
              {t("InputErrors.invalid_fn")}
            </Text>
          )}
          <View
            style={[styles.pibInputView, lastNameError && styles.inputError]}
          >
            <TextInput
              style={{ color: "black", fontSize: 12 }}
              placeholder={t("RegisterScreen.lastName")}
              placeholderTextColor="#222222"
              value={lastName}
              maxLength={36}
              onChangeText={(text) => {
                const textInputRegex = /^(?!\s).*/;

                if (text.length === 0 && textInputRegex.test(text) === false) {
                  setLastName(text);
                  return setLastNameError(true);
                }
                setLastName(text);
                return setLastNameError(false);
              }}
              keyboardType="default"
            />
          </View>
          {lastNameError && (
            <Text style={{ color: "red", fontSize: 10, marginLeft: "1%" }}>
              {t("InputErrors.invalid_ln")}
            </Text>
          )}
          <View style={[styles.pibInputView, phoneError && styles.inputError]}>
            <TextInput
              style={{ color: "black", fontSize: 12 }}
              placeholder={t("RegisterScreen.number")}
              placeholderTextColor="#222222"
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
              keyboardType="phone-pad"
            />
          </View>
          {phoneError && (
            <Text style={{ color: "red", fontSize: 10, marginLeft: "1%" }}>
              {t("InputErrors.invalid_phone")}
            </Text>
          )}
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => {
              if (
                phone.trim() !== "" &&
                firstName.trim() !== "" &&
                lastName.trim() !== ""
              ) {
                return registerHandler();
              } else {
                setFirstNameError(true);
                setLastNameError(true);
                setPhoneError(true);

                return Alert.alert(
                  t("RegisterScreen.Error"),
                  t("InputErrors.cannot_be_empty")
                );
              }
            }}
          >
            <Text style={styles.loginText}>
              {t("RegisterScreen.registerBtn")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.registerText}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "500",
              right: 4,
              color: "rgba(100, 100, 100, 1)",
            }}
          >
            {t("RegisterScreen.haveAcc")}
          </Text>
          <TouchableOpacity style={styles.showPassword} onPress={openLogin}>
            <Text
              style={{
                alignItems: "flex-end",
                fontSize: 11,
                fontWeight: "500",
                color: "rgba(100, 100, 100, 1)",
                textDecorationLine: "underline",
              }}
            >
              {t("RegisterScreen.login")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;
const styles = StyleSheet.create({
  container: {
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
    textAlign: "center",
  },
  inputView: {
    color: "black",
    width: "100%",
    height: "15%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
    justifyContent: "center",
    paddingLeft: 10,
    marginTop: "12%",
  },
  pibInputView: {
    color: "black",
    width: "100%",
    height: "15%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
    marginTop: 5,
    justifyContent: "center",
    paddingLeft: 10,
  },
  inputText: {
    color: "black",
    fontSize: 12,
  },
  TextRegister: {
    textAlign: "center",
    top: "5%",
    width: "90%",
  },
  inputContainer: {
    color: "black",
    top: "10%",
    width: "90%",
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
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },

  btnContainer: {
    flexDirection: "row",
  },
  loginText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  lineStyle: {
    borderWidth: 0.7,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "80%",
    margin: 10,
    top: "5%",
  },
  registerText: { flexDirection: "row", top: "11%" },
  inputError: {
    borderColor: "red",
  },
});
