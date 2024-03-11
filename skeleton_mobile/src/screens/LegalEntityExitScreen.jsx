import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import LegalEntityNavigationTabs from "../Elements/LegalEntityNavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from "prop-types";

const LegalEntityExitScreen = ({ navigation, setAuthToken }) => {
  const { t } = useTranslation();
  const openLogin = () => {
    AsyncStorage.removeItem("token").then(async () => {
      await AsyncStorage.removeItem("cardInfo");
      setAuthToken("");
      return navigation.navigate("Login");
    });
  };

  const openMenu = () => {
    return navigation.navigate("LegalEntity");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <View style={styles.containerImg}>
            <Image
              source={require("../assets/images/horizontal_transp.png")}
              style={styles.logoLoginScreen}
            />
          </View>
          <View style={styles.exitTextContainer}>
            <Text style={styles.exitText}>{t("ExitScreen.exitText")}</Text>
          </View>
          <View style={styles.buttonCard}>
            <TouchableOpacity style={styles.exit} onPress={openLogin}>
              <Text style={styles.exitsText}>{t("ExitScreen.exit")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notExit} onPress={openMenu}>
              <Text style={styles.notExitText}>{t("ExitScreen.notExit")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <LegalEntityNavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LegalEntityExitScreen;

LegalEntityExitScreen.propTypes = {
  setAuthToken: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    color: "#008080",
    height: "90%",
    paddingTop: 20,
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  text: {
    color: "white",
    fontSize: 30,
  },
  containerImg: {
    resizeMode: "contain",
    marginLeft: "15%",
    marginBottom: 40,
    paddingHorizontal: 20,
    height: "5%",
  },
  logoLoginScreen: {
    width: 220,
    height: 29,
  },
  exitTextContainer: {
    height: "10%",
    width: "80%",
    alignItems: "center",

    marginLeft: "10%",
    marginTop: "17%",
  },
  exitText: {
    color: "#222222",
    alignItems: "center",
    fontWeight: "700",

    fontSize: 20,
    textAlign: "center",
  },
  buttonCard: {
    flexDirection: "row",
    top: "14%",
    width: "98%",
    textAlign: "center",
    alignItems: "center",
    height: "7%",
    justifyContent: "space-between",
    paddingHorizontal: "1%",
  },
  exit: {
    width: "49%",
    height: "100%",
    marginLeft: "3%",
    justifyContent: "center",
    padding: "2%",
    backgroundColor: "#18aa5e",
    borderRadius: 6,
    borderWidth: 1,
    textAlign: "center",
    alignItems: "center",
    borderColor: "#18aa5e",
  },
  exitsText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    alignItems: "center",
  },
  notExit: {
    width: "44%",
    height: "100%",
    marginLeft: "3%",
    padding: "3%",
    backgroundColor: "white",
    alignItems: "center",
    borderColor: "green",
    justifyContent: "center",
    borderWidth: 1,
    textAlign: "center",
    borderRadius: 6,
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  notExitText: {
    color: "#18AA5E",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
