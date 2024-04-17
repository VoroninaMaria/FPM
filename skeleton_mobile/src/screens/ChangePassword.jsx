import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  Text,
  TextInput,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationTabs from "../Elements/NavigationTabs";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePassword = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isOldPasswordHidden, setIsOldPasswordHidden] = useState(true);
  const [isNewPasswordHidden, setIsNewPasswordHidden] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);

  const openResetPassword = () => {
    navigation.navigate("ResetPassword");
  };

  const showOldPassword = () => setIsOldPasswordHidden(!isOldPasswordHidden);
  const showNewPassword = () => setIsNewPasswordHidden(!isNewPasswordHidden);

  const handleConfirmPass = () => {
    if (oldPasswordError === false && newPasswordError === false) {
      return AsyncStorage.getItem("token")
        .then((token) => {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `
              mutation UpdatePassword($old_password: String!, $new_password: String!) {
                updatePassword(old_password: $old_password, new_password: $new_password) {
                  id
                }
              }
            `,
                variables: {
                  old_password: oldPassword,
                  new_password: newPassword,
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
                if (
                  res.data.errors[0].message.includes("old_password_invalid")
                ) {
                  setOldPasswordError(true);
                  return Alert.alert(
                    t("SettingsScreen.Errors.name"),
                    t("SettingsScreen.Errors.invalid_old_password")
                  );
                }
                return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
              }

              setOldPassword("");
              setNewPassword("");
              setNewPasswordError(false);

              await AsyncStorage.removeItem("token");

              return navigation.navigate("Login");
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
              source={require("../assets/images/Sports.png")}
            />
          </View>
          <View style={styles.passwordContainer}>
            <View style={styles.pinText}>
              <Text style={{ color: "black" }}>
                {" "}
                {t("SettingsScreen.changePassword")}
              </Text>
            </View>
            <KeyboardAvoidingView behavior="position" style={styles.container}>
              <View
                style={[
                  styles.inputContainer1,
                  oldPasswordError && styles.inputError,
                ]}
              >
                <TextInput
                  secureTextEntry={isOldPasswordHidden}
                  style={styles.inputText}
                  placeholder={t("SettingsScreen.oldPassword")}
                  maxLength={6}
                  value={oldPassword}
                  onChangeText={(text) => {
                    const textInputRegex = /^(?!\s).*/;

                    if (textInputRegex.test(text) === false) {
                      setOldPassword(text);
                      return setOldPasswordError(true);
                    }
                    setOldPassword(text);
                    return setOldPasswordError(false);
                  }}
                  placeholderTextColor="black"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.iconsInput}
                  onPress={showOldPassword}
                >
                  <Icon
                    name={isOldPasswordHidden ? "eye-slash" : "eye"}
                    size={17}
                    color={isOldPasswordHidden ? "#E2E2E2" : "#000000"}
                  />
                </TouchableOpacity>
              </View>
              {oldPasswordError && (
                <Text style={{ color: "red", fontSize: 10, marginLeft: "7%" }}>
                  {t("SettingsScreen.Errors.invalid_old_password")}
                </Text>
              )}
              <View
                style={[
                  styles.inputContainer2,
                  newPasswordError && styles.inputError,
                ]}
              >
                <TextInput
                  secureTextEntry={isNewPasswordHidden}
                  style={styles.inputText}
                  placeholder={t("SettingsScreen.newPassword")}
                  maxLength={6}
                  value={newPassword}
                  onChangeText={(text) => {
                    const textInputRegex = /^(?!\s).*/;

                    if (textInputRegex.test(text) === false) {
                      setNewPassword(text);
                      return setNewPasswordError(true);
                    }
                    setNewPassword(text);
                    return setNewPasswordError(false);
                  }}
                  placeholderTextColor="black"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.iconsInput}
                  onPress={showNewPassword}
                >
                  <Icon
                    name={isNewPasswordHidden ? "eye-slash" : "eye"}
                    size={17}
                    color={isNewPasswordHidden ? "#E2E2E2" : "#000000"}
                  />
                </TouchableOpacity>
              </View>
              {newPasswordError && (
                <Text style={{ color: "red", fontSize: 10, marginLeft: "7%" }}>
                  {t("SettingsScreen.Errors.invalid_new_password")}
                </Text>
              )}
            </KeyboardAvoidingView>
          </View>

          <View style={[styles.changeText]}>
            <Text
              style={{
                alignItems: "flex-end",
                fontSize: 12,
                fontWeight: "500",
                marginTop: "2%",
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
                  marginTop: "8%",
                }}
              >
                Відновити пароль
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonChange}>
            <Pressable
              style={styles.btnCha}
              onPress={() => {
                if (oldPassword.trim() !== "" && newPassword.trim() !== "") {
                  return handleConfirmPass();
                } else {
                  setOldPasswordError(true);
                  setNewPasswordError(true);

                  return Alert.alert(
                    t("RegisterScreen.Error"),
                    t("InputErrors.cannot_be_empty")
                  );
                }
              }}
            >
              <Text style={styles.txtCha}>
                {t("SettingsScreen.savePassword")}
              </Text>
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

export default ChangePassword;

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
    marginTop: "15%",
    width: 150,
    height: 45,
  },
  pinText: {
    left: 20,
    top: 20,
    color: "black",
  },
  inputContainer1: {
    width: "90%",
    borderRadius: 6,
    borderColor: "#E2E2E2",
    borderWidth: 1,
    height: "35%",
    marginLeft: 20,
    marginTop: "10%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer2: {
    width: "90%",
    borderRadius: 6,
    borderColor: "#E2E2E2",
    borderWidth: 1,
    height: "35%",
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
  passwordContainer: {
    marginTop: "30%",
    height: "20%",
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
    borderColor: "#84739a",
    borderWidth: 2,
    color: "black",
    backgroundColor: "#cbb7c3",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
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
    marginTop: "30%",
  },
});
