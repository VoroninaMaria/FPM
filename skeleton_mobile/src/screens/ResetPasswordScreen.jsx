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

const ResetPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [phoneError, setPhoneError] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [phone, setPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [pinHidden, setPinHidden] = useState(true);

  const showPin = () => setPinHidden(!pinHidden);

  const resetPasswordHandler = () => {
    if (phoneError === false && pinError === false) {
      return axios
        .post(`${Config.baseUrl}/client/auth/reset_password`, {
          phone: phone,
          merchant: "Mango",
        })
        .then(async (res) => {
          if (res.status === 200) {
            return navigation.navigate("ConfirmResetOTP", {
              secret: res.data.secret,
              phone: phone,
            });
          }
        })
        .catch((error) => {
          if (error.message.includes("status code 406")) {
            return Alert.alert(t("RegisterScreen.Error"), t("ErrorTXTDef"));
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
        <View style={styles.inputContainer}>
          <Text style={styles.logo}>Відновити пароль</Text>
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
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={resetPasswordHandler}
          >
            <Text style={styles.loginText}>Відправити смс-код</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineStyle} />
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
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
    height: 29,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 20,
    color: "black",
    top: "15%",
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
    marginTop: "2%",
  },
  inputText: {
    height: 40,
    color: "white",
  },
  inputContainer: {
    marginTop: "25%",
    width: "90%",
  },
  iconsInput: {
    marginRight: 10,
  },
  loginBtn: {
    width: "50%",
    backgroundColor: "rgba(24, 170, 94, 1)",
    borderRadius: 6,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 3,
    borderColor: "#00FF7F",
    borderWidth: 0.75,
    marginTop: "8%",
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
    fontFamily: "Raleway",
    color: "white",
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
