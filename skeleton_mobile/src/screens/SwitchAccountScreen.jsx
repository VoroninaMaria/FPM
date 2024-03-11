import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Config from "./config.js";
import "../localization/i18n";

const ChangeProfile = ({ navigation }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useTranslation();
  const [codeEdroup, setCodeEdroup] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [codeEdroupError, setCodeEdroupError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);

  const openLegalEntity = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert(t("Session.session"), t("Session.finished"));
          return navigation.navigate("Login");
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `
                  query getJurCard($code_edroup: String!, $phone: String!) {
                    getJurQRCard(code_edroup: $code_edroup, phone: $phone) {
                      id, card_name, serial_external, pin1, balance
                    }
                  }
                `,
                variables: { code_edroup: codeEdroup, phone: phoneNumber },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then(async (res) => {
              if (res.data?.errors) {
                return Alert.alert(
                  t("InputErrors.error"),
                  "Неправильно введено дані. Перевірте свою інформацію та повторіть спробу пізніше."
                );
              }
              const {
                data: {
                  data: { getJurQRCard },
                },
              } = res;

              return AsyncStorage.multiSet([
                ["cardInfo", JSON.stringify(getJurQRCard)],
                ["userInfo", JSON.stringify({ codeEdroup, phoneNumber })],
              ]).then(() => {
                return navigation.navigate("LegalEntity");
              });
            })
            .catch(() => {
              return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
            });
        }
      })
      .catch(async () => {
        await AsyncStorage.removeItem("cardInfo");
        return Alert.alert(t("Session.session"), t("Session.finished"));
      });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} />}
      >
        <View style={styles.container}>
          <View style={styles.topImage}>
            <Image
              style={styles.tinyLogo}
              source={require("../assets/images/horizontal_transp.png")}
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Код ЄДРПОУ</Text>
            <View style={[styles.input1, codeEdroupError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Код ЄДРПОУ *"
                value={codeEdroup}
                placeholderTextColor="#A9A9A9"
                maxLength={20}
                onChangeText={(text) => {
                  const textInputRegex = /^(?!\s).*/;

                  if (textInputRegex.test(text) === false) {
                    setCodeEdroup(text);
                    return setCodeEdroupError(true);
                  }
                  setCodeEdroup(text);
                  return setCodeEdroupError(false);
                }}
                blurOnSubmit={true}
                keyboardType="default"
              />
              <Icon
                style={styles.icons}
                name="edit"
                size={20}
                color="#18AA5E"
              />
            </View>
            {codeEdroupError && (
              <Text
                style={{
                  color: "red",
                  fontSize: 11,
                  marginLeft: "1%",
                }}
              >
                Неправильно введено код ЄДРПОУ
              </Text>
            )}
            <Text style={styles.label}>Номер телефону</Text>
            <View
              style={[styles.input1, phoneNumberError && styles.inputError]}
            >
              <TextInput
                style={styles.input}
                placeholder="Номер телефону *"
                value={phoneNumber}
                placeholderTextColor="#A9A9A9"
                maxLength={12}
                onChangeText={(text) => {
                  if (text.startsWith("380") && text?.length === 12) {
                    setPhoneNumber(text);
                    return setPhoneNumberError(false);
                  }
                  setPhoneNumber(text);
                  return setPhoneNumberError(true);
                }}
                blurOnSubmit={true}
                keyboardType="phone-pad"
              />
              <Icon
                style={styles.icons}
                name="edit"
                size={20}
                color="#18AA5E"
              />
            </View>
            {phoneNumberError && (
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (!codeEdroup || !phoneNumber) {
                    setCodeEdroupError(true);
                    setPhoneNumberError(true);
                    return Alert.alert(
                      "Помилка",
                      "Будь ласка, заповніть всі обов'язкові поля."
                    );
                  }
                  return openLegalEntity();
                }}
              >
                <Text style={styles.buttonText}>Перейти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangeProfile;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    alignItems: "center",
  },
  bottomContainer: {
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  topImage: {
    height: "20%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  tinyLogo: {
    marginTop: "18%",
    width: 270,
    height: "80%",
    resizeMode: "contain",
  },
  form: {
    marginTop: "20%",
    width: "80%",
  },
  label: {
    marginTop: 10,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    fontSize: 13,
    width: "90%",
    color: "black",
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    width: "70%",
    marginTop: 40,
    backgroundColor: "#18AA5E",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  inputContainerTop: {
    width: "100%",
    height: "40%",
  },
  input1: {
    width: "100%",
    borderRadius: 6,
    borderColor: "#222222",
    borderWidth: 1,
    height: "15%",
    marginTop: "3%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icons: {
    marginRight: 10,
  },
  inputError: {
    borderColor: "red",
  },
});
