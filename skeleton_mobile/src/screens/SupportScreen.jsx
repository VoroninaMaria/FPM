import React from "react";
import { StyleSheet, View, Image, Text, SafeAreaView } from "react-native";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";
const SupportScreen = ({ navigation }) => {
  const { t } = useTranslation();

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
          <View style={styles.supportNumber}>
            <View style={{ width: "50%" }}>
              <Text
                style={{
                  marginLeft: "11%",
                  fontWeight: "400",
                  color: "#222222",
                }}
              >
                {t("SupportScreen.customerSupport")}
              </Text>
            </View>
            <View style={{ marginLeft: "2%" }}>
              <Text
                style={{
                  color: "#e6ab00",
                  fontWeight: "bold",
                }}
              >
                0 666 66 66 66
              </Text>
              <View
                style={{
                  width: "100%",
                  borderBottomWidth: 2,
                  borderColor: "#e6ab00",
                }}
              ></View>
            </View>
          </View>
          <View style={styles.supportEmail}>
            <View style={{ width: "50%" }}>
              <Text
                style={{
                  marginLeft: "5%",
                  fontWeight: "400",
                  color: "#222222",
                }}
              >
                {t("SupportScreen.emailSupport")}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: "#e6ab00",
                  fontWeight: "bold",
                }}
              >
                ..............@gmail.com
              </Text>
              <View
                style={{
                  width: "100%",
                  borderBottomWidth: 2,
                  borderColor: "#e6ab00",
                }}
              ></View>
            </View>
          </View>
          <View style={styles.textSupport}>
            <Text style={styles.textForClient}>
              {t("SupportScreen.textForClient")}
            </Text>
            <Text style={styles.textForClient}>
              {t("SupportScreen.textSupport")}
            </Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    color: "#008080",
    height: "90%",
    width: "100%",
    paddingTop: 30,
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
    alignItems: "center",
    resizeMode: "contain",
    marginBottom: 40,
    paddingHorizontal: 20,
    height: "5%",
  },
  logoLoginScreen: {
    width: 220,
    height: 29,
  },
  supportNumber: {
    width: "100%",
    flexDirection: "row",
  },
  supportEmail: {
    flexDirection: "row",
    marginTop: "10%",
    marginLeft: "3%",
  },
  textSupport: {
    marginTop: "13%",

    height: "20%",
    width: "90%",
    marginLeft: "5%",
  },
  textForClient: {
    fontWeight: "400",
    fontSize: 12,
    marginTop: "1%",
    color: "rgba(34, 34, 100, 0.3922)",
  },
});
