import React from "react";
import { StyleSheet, View, Text, Image, SafeAreaView } from "react-native";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";

const PartnersScreen = ({ navigation }) => {
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
          <Text style={styles.partnerText}>
            {" "}
            {t("PartnersScreen.ourPartners")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              margin: 0,
              justifyContent: "space-around",
              marginTop: 45,
            }}
          >
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
          </View>
          <View style={styles.containerr}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
          </View>
          <View style={styles.containerr}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>

            <View style={styles.circle}>
              <Text style={styles.circleText}>{t("PartnersScreen.logo")}</Text>
            </View>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PartnersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerBrands: {
    textAlign: "center",
    backgroundColor: "white",
    height: "90%",
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
    width: "100%",
    height: "5%",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoLoginScreen: {
    width: 220,
    top: 26,
    height: 29,
  },
  partnerText: {
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    top: 10,
  },
  circle: {
    width: "27%",
    height: 108,
    borderRadius: 62,
    alignItems: "center",
    backgroundColor: "#d9d9d9",
  },
  circleText: {
    color: "black",
    marginTop: "40%",
  },
  containerr: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
