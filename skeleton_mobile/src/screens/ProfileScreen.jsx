import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useTranslation();
  const [profileInfo, setProfileInfo] = useState({});
  const [changeFirstName, setChangeFirstName] = useState(
    profileInfo?.first_name
  );
  const [changeLastName, setChangeLastName] = useState(profileInfo?.last_name);

  const [changeEmail, setChangeEmail] = useState(profileInfo?.email);
  const [isPressed, setIsPressed] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const getProfileInfo = () =>
    AsyncStorage.getItem("token").then((token) => {
      if (!token) {
        Alert.alert(t("Session.session"), t("Session.finished"));
        return navigation.navigate("Login");
      }
      return axios
        .post(
          `${Config.baseUrl}/client/graphql`,
          {
            query: "{self {first_name, last_name, email, unconfirmed_changes}}",
            variables: {},
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
              data: { self },
            },
          } = res;
          setProfileInfo(self);
        })
        .catch((error) => {
          // Alert.alert(t("ProfileScreen.Error"), t("ProfileScreen.ErrorTXT"));
        });
    });

  useEffect(() => {
    getProfileInfo();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfileInfo();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const changeProfileInfo = () => {
    setIsPressed(true);
  };

  const handleChange = (fieldName, value) => {
    if (
      emailError === false &&
      firstNameError === false &&
      lastNameError === false
    ) {
      return AsyncStorage.getItem("token")
        .then((token) => {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `
                mutation clientChanges($field_name: String!, $value: String!) {
                  createClientChangeRequest(field_name: $field_name, value: $value) {
                    client_id
                  }
                }
              `,
                variables: { field_name: fieldName, value: value },
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
                  data: { updateDatexClient },
                },
              } = res;

              console.log(res.body);

              setChangeFirstName(profileInfo.first_name);
              setChangeLastName(profileInfo.last_name);
              setChangeEmail(profileInfo.email);
              setIsPressed(false);

              return updateDatexClient;
            });
        })
        .catch((error) => {
          console.log(error);
          Alert.alert(t("Session.session"), t("Session.finished"));
        });
    }
  };
  const UnconfirmedChanges = () => {
    if (profileInfo?.unconfirmed_changes?.length > 0) {
      return (
        <Text
          style={{
            color: "grey",
            fontSize: 15,
            marginTop: "2%",
          }}
        >
          {t("ProfileScreen.ChangesInProgress")}
        </Text>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.topImage}>
            <Image
              style={styles.tinyLogo}
              source={require("../assets/images/horizontal_transp.png")}
            />
          </View>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={require("../assets/images/profile.jpeg")}
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Імʼя</Text>
            <View style={[styles.input1, firstNameError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder={
                  profileInfo?.first_name
                    ? profileInfo?.first_name
                    : "First name"
                }
                value={changeFirstName}
                placeholderTextColor="#A9A9A9"
                maxLength={35}
                onChangeText={(text) => {
                  const textInputRegex = /^(?!\s).*/;

                  if (textInputRegex.test(text) === false) {
                    setChangeFirstName(text);
                    return setFirstNameError(true);
                  }
                  setChangeFirstName(text);
                  return setFirstNameError(false);
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
            {firstNameError && (
              <Text style={{ color: "red", fontSize: 10, marginLeft: "3%" }}>
                {t("InputErrors.invalid_fn")}
              </Text>
            )}
            <Text style={styles.label}>Прізвище</Text>
            <View style={[styles.input1, lastNameError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder={
                  profileInfo?.last_name ? profileInfo?.last_name : "Last name"
                }
                value={changeLastName}
                placeholderTextColor="#A9A9A9"
                maxLength={35}
                onChangeText={(text) => {
                  const textInputRegex = /^(?!\s).*/;

                  if (textInputRegex.test(text) === false) {
                    setChangeLastName(text);
                    return setLastNameError(true);
                  }
                  setChangeLastName(text);
                  return setLastNameError(false);
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
            {lastNameError && (
              <Text style={{ color: "red", fontSize: 10, marginLeft: "3%" }}>
                {t("InputErrors.invalid_ln")}
              </Text>
            )}
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input1, emailError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder={profileInfo?.email ? profileInfo?.email : "Email"}
                value={changeEmail}
                maxLength={36}
                placeholderTextColor="#A9A9A9"
                onChangeText={(text) => {
                  const emailRegex =
                    /^[zA-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                  if (emailRegex.test(text) === false) {
                    setChangeEmail(text);
                    return setEmailError(true);
                  }
                  setChangeEmail(text);
                  return setEmailError(false);
                }}
                blurOnSubmit={true}
                keyboardType="email-address"
              />
              <Icon
                style={styles.icons}
                name="edit"
                size={20}
                color="#18AA5E"
              />
            </View>
            {emailError && (
              <Text style={{ color: "red", fontSize: 10, marginLeft: "3%" }}>
                {t("InputErrors.invalid_email")}
              </Text>
            )}
            <UnconfirmedChanges />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (changeFirstName && changeFirstName.trim() !== "")
                  handleChange("first_name", changeFirstName);
                if (changeLastName && changeLastName.trim() !== "")
                  handleChange("last_name", changeLastName);
                if (changeEmail && changeEmail.trim() !== "")
                  handleChange("email", changeEmail);
              }}
            >
              <Text style={styles.buttonText}>{t("ProfileScreen.button")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    height: "9%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  tinyLogo: {
    marginTop: 20,
    width: 230,
    height: 27,
    resizeMode: "contain",
  },

  form: {
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
  button: {
    marginTop: 40,
    backgroundColor: "#18AA5E",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  avatarContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButtonText: {
    color: "#1E90FF",
    fontSize: 18,
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
    height: "12%",
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
