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
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import NavigationTabs from "../Elements/NavigationTabs";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RefillScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Поповнення паливної карти!");
  const [amountError, setAmountError] = useState(false);

  const topupHandler = () => {
    if (!amount.trim()) {
      return Alert.alert(
        t("InputErrors.error"),
        t("InputErrors.cannot_be_empty")
      );
    }

    if (amountError === false) {
      return AsyncStorage.getItem("token")
        .then((token) => {
          if (!token) {
            return Alert.alert(t("Session.session"), t("Session.finished"));
          }
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `
                  mutation createClientTrunc($amount: Int!, $description: String!, $short_description: String!) {
                    createTrunc(amount: $amount, description: $description, short_description: $short_description) {
                      response
                    }
                  }
                `,
                variables: {
                  amount: parseFloat(amount),
                  description: description,
                  short_description: description,
                },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              const {
                data: {
                  data: {
                    createTrunc: { response },
                  },
                },
              } = res;

              return Linking.openURL(response.url);
            })
            .catch(() => {
              return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
            });
        })
        .catch(() => {
          Alert.alert(t("Session.session"), t("Session.finished"));
          return navigation.navigate("Login");
        });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.containerImg}>
            <Image
              source={require("../assets/images/gymLogo.png")}
              style={styles.logoLoginScreen}
            />
          </View>
          <View style={styles.TextRegister}>
            <Text style={styles.textRegistration}>
              {t("ReffilScreen.title")}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={[styles.inputView, amountError && styles.inputError]}>
              <TextInput
                style={{ color: "black", fontSize: 13 }}
                placeholder={t("ReffilScreen.amountPlaceholferText")}
                placeholderTextColor="#222222"
                value={amount}
                maxLength={36}
                onChangeText={(text) => {
                  const textInputRegex = /^(?!\s).*/;

                  if (textInputRegex.test(text) === false) {
                    setAmount(text);
                    return setAmountError(true);
                  }
                  setAmount(text);
                  return setAmountError(false);
                }}
                keyboardType="number-pad"
              />
            </View>
            {amountError && (
              <Text
                style={{
                  color: "red",
                  fontSize: 11,
                  marginLeft: "1%",
                }}
              >
                {t("InputErrors.cannot_be_empty")}
              </Text>
            )}
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.loginBtn} onPress={topupHandler}>
              <Text style={styles.loginText}>{t("ReffilScreen.topUpBtn")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RefillScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  containerImg: {
    resizeMode: "contain",
    top: 64,
    right: 10,
    left: 0,
    paddingHorizontal: 20,
    padding: 10,
  },
  topContainer: {
    width: "100%",
    height: "90%",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  logoLoginScreen: {
    width: 220,
    height: 90,
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
    height: "30%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
    justifyContent: "center",
    paddingLeft: 10,
    marginTop: "5%",
  },
  pibInputView: {
    color: "black",
    width: "100%",
    height: "15%",
    borderColor: "rgba(226, 226, 226, 1)",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
    justifyContent: "center",
    paddingLeft: 10,
  },
  inputText: {
    color: "black",
  },
  TextRegister: {
    textAlign: "center",
    top: "5%",
    width: "90%",
  },
  inputContainer: {
    color: "black",
    top: "15%",
    width: "90%",
  },
  loginBtn: {
    width: 263,
    backgroundColor: "#f2cb84",
    borderRadius: 6,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    borderColor: "#e6ab00",
    borderWidth: 0.75,
    shadowColor: "rgba(246,199,112,0.26514355742296913)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  btnContainer: {
    marginTop: "5%",
    flexDirection: "row",
  },
  loginText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  registerText: { flexDirection: "row", top: "22%" },
  inputError: {
    borderColor: "red",
  },
});
