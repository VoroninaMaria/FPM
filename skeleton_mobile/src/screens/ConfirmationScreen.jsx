import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AntIcon from "react-native-vector-icons/AntDesign";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";

const ConfirmationScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const openHome = () => {
    navigation.navigate("CardScreen");
  };

  const { name } = route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <View style={styles.containerImg}></View>
          <View style={styles.check}>
            <Icon name="check-circle" color="#18aa5e" size={60} />
          </View>
          <View style={styles.textConfirm}>
            <Text style={styles.textWelcome}>
              {t("ConfirmScreen.greating")}
              {name}
            </Text>
            <Text style={styles.textAboutAccount}>
              {t("ConfirmScreen.accs")}
            </Text>
          </View>
          <View style={styles.button}>
            <TouchableOpacity style={styles.nextButton} onPress={openHome}>
              <Text style={styles.nextButtontext}>
                {t("ConfirmScreen.button")}
              </Text>
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

export default ConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    color: "#008080",
    height: "90%",
    paddingTop: "15%",
    flexDirection: "column",
  },
  bottomContainer: {
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
    marginBottom: 40,
    alignItems: "center",
    height: "5%",
    paddingHorizontal: 20,
  },
  logoLoginScreen: {
    width: 300,
    height: 40,
  },
  check: {
    height: "11%",
    alignItems: "center",
    marginTop: "13%",
  },
  textConfirm: {
    height: "15%",
    alignItems: "center",
  },
  textWelcome: {
    color: "#222222",
    marginTop: "15%",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 22,
    fontFamily: "Raleway",
  },
  textAboutAccount: {
    color: "#222222",
    marginTop: "1%",
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 22,
    fontFamily: "Raleway",
    textAlign: "center",
  },
  button: {
    marginTop: "15%",
    height: "13%",
    alignItems: "center",
  },
  nextButton: {
    width: "42%",
    alignItems: "center",
    padding: "3%",
    backgroundColor: "#18aa5e",
    borderRadius: 6,
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,

    borderWidth: 1,
    borderColor: "#18aa5e",
  },
  nextButtontext: {
    fontSize: 14,
    color: "white",
    fontFamily: "Inter",
    fontWeight: "600",
    lineHeight: 16.94,
  },
});
