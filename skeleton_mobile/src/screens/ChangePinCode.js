import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";
import Config from "./config.js";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePinScreen = () => {
  const { t } = useTranslation();
  const [isOldPinHidden, setIsOldPinHidden] = useState(true);
  const [isNewPinHidden, setIsNewPinHidden] = useState(true);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [oldPinError, setOldPinError] = useState(false);
  const [newPinError, setNewPinError] = useState(false);

  const showOldPin = () => setIsOldPinHidden(!isOldPinHidden);
  const showNewPin = () => setIsNewPinHidden(!isNewPinHidden);

  const handleChangePin = () => {
    if (oldPinError === false && newPinError === false) {
      return AsyncStorage.getItem("token")
        .then((token) => {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `
              mutation UpdatePinCode($old_pin: String!, $new_pin: String!) {
                updatePinCode(old_pin: $old_pin, new_pin: $new_pin) {
                  id
                }
              }
            `,
                variables: {
                  old_pin: oldPin,
                  new_pin: newPin,
                },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then(async (res) => {
              if (res.data.errors) {
                if (res.data.errors[0].message.includes("old_pin_invalid")) {
                  setOldPinError(true);
                  return Alert.alert(
                    t("SettingsScreen.Errors.name"),
                    t("SettingsScreen.Errors.invalid_old_pin")
                  );
                }
                return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
              }

              setOldPin("");
              setNewPin("");
              setOldPinError(false);
              setNewPinError(false);
            })
            .catch(() => {
              return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
            });
        })
        .catch(() => {
          Alert.alert(t("Session.session"), t("Session.finished"));
        });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <View style={styles.topImage}>
            <Image
              style={styles.tinyLogo}
              source={require("../assets/images/gymLogo.png")}
            />
          </View>
          <View style={styles.pinContainer}>
            <View style={styles.pinText}>
              <Text style={{ color: "black" }}>
                {" "}
                {t("SettingsScreen.changePin")}
              </Text>
            </View>
            <KeyboardAvoidingView behavior="position" style={styles.container}>
              <View
                style={[
                  styles.inputContainer3,
                  oldPinError && styles.inputError,
                ]}
              >
                <TextInput
                  secureTextEntry={isOldPinHidden}
                  style={styles.inputText}
                  placeholder={t("SettingsScreen.oldPin")}
                  maxLength={4}
                  value={oldPin}
                  onChangeText={(text) => {
                    const textInputRegex = /^(?!\s).*/;

                    if (textInputRegex.test(text) === false) {
                      setOldPin(text);
                      return setOldPinError(true);
                    }
                    setOldPin(text);
                    return setOldPinError(false);
                  }}
                  placeholderTextColor="black"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.iconsInput}
                  onPress={showOldPin}
                >
                  <Icon
                    name={isOldPinHidden ? "eye-slash" : "eye"}
                    size={17}
                    color={isOldPinHidden ? "#E2E2E2" : "#000000"}
                  />
                </TouchableOpacity>
              </View>
              {oldPinError && (
                <Text style={{ color: "red", fontSize: 10, marginLeft: "7%" }}>
                  {t("SettingsScreen.Errors.invalid_old_pin")}
                </Text>
              )}
              <View
                style={[
                  styles.inputContainer4,
                  newPinError && styles.inputError,
                ]}
              >
                <TextInput
                  secureTextEntry={isNewPinHidden}
                  style={styles.inputText}
                  placeholder={t("SettingsScreen.newPin")}
                  maxLength={4}
                  value={newPin}
                  onChangeText={(text) => {
                    const textInputRegex = /^(?!\s).*/;

                    if (textInputRegex.test(text) === false) {
                      setNewPin(text);
                      return setNewPinError(true);
                    }
                    setNewPin(text);
                    return setNewPinError(false);
                  }}
                  placeholderTextColor="black"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.iconsInput}
                  onPress={showNewPin}
                >
                  <Icon
                    name={isNewPinHidden ? "eye-slash" : "eye"}
                    size={17}
                    color={isNewPinHidden ? "#E2E2E2" : "#000000"}
                  />
                </TouchableOpacity>
              </View>
              {newPinError && (
                <Text style={{ color: "red", fontSize: 10, marginLeft: "7%" }}>
                  {t("SettingsScreen.Errors.invalid_new_pin")}
                </Text>
              )}
            </KeyboardAvoidingView>
          </View>

          <View style={styles.buttonChange}>
            <Pressable
              style={styles.btnCha}
              onPress={() => {
                if (oldPin.trim() !== "" && newPin.trim() !== "") {
                  return handleChangePin();
                } else {
                  setOldPinError(true);
                  setNewPinError(true);

                  return Alert.alert(
                    t("RegisterScreen.Error"),
                    t("InputErrors.cannot_be_empty")
                  );
                }
              }}
            >
              <Text style={styles.txtCha}>{t("SettingsScreen.savePin")}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChangePinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    height: "90%",
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  topImage: {
    height: "5%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  tinyLogo: {
    marginTop: 20,
    width: 230,
    height: 95,
  },
  pinText: {
    left: 20,
    top: 20,
    color: "black",
  },
  inputContainer3: {
    width: "90%",
    borderRadius: 6,
    borderColor: "#E2E2E2",
    borderWidth: 1,
    height: "30%",
    marginLeft: 20,
    marginTop: "10%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer4: {
    width: "90%",
    borderRadius: 6,
    borderColor: "#E2E2E2",
    borderWidth: 1,
    height: "30%",
    marginLeft: 20,
    marginTop: "5%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputText: {
    width: "60%",
    color: "black",
    height: "100%",
    fontSize: 12,
    margin: "3%",
    fontFamily: "Raleway",
  },
  iconsInput: {
    marginRight: 15,
  },
  pinContainer: {
    marginTop: "30%",
    height: "33%",
  },
  buttonChange: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: "20%",
    color: "black",
  },
  btnCha: {
    width: "40%",
    height: "25%",
    borderRadius: 6,
    borderColor: "#e6ab00",
    borderWidth: 2,
    color: "black",
    backgroundColor: "#f2cb84",

    justifyContent: "center",
    alignItems: "center",
    marginTop: "25%",
  },
  txtCha: {
    color: "black",
  },
  btnExit: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    width: "75%",
    height: "50%",
    borderColor: "#E2E2E2",
    borderTopWidth: 1,
  },
  icons: {
    marginRight: "5%",
  },
  logoutBtn: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutText: {
    top: 2,
    fontSize: 14,
    fontWeight: "500",
    color: "#646464",
  },

  inputError: {
    borderColor: "red",
  },
  pinChangeText: {
    marginTop: "10%",
    flexDirection: "row",
    justifyContent: "center",
  },
  btnChaPass: {
    width: "40%",
    height: "45%",
    borderRadius: 6,
    borderColor: "#18AA5E",
    borderWidth: 2,
    backgroundColor: "#18AA5E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },
  btnChaPassCon: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: "10%",
  },
  changeText: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "10%",
  },
});
