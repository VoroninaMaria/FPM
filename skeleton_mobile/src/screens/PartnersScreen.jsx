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
            {t("PartnersScreen.ourTrainers")}
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
              <Image
                source={require("../assets/images/tr1.jpeg")}
                style={styles.circleImage}
              />
            </View>

            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr2.jpeg")}
                style={styles.circleImage}
              />
            </View>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr3.jpeg")}
                style={styles.circleImage}
              />
            </View>
          </View>
          <View style={styles.containerr}>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr4.jpeg")}
                style={styles.circleImage}
              />
            </View>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr5.jpeg")}
                style={styles.circleImage}
              />
            </View>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr6.jpeg")}
                style={styles.circleImage}
              />
            </View>
          </View>
          <View style={styles.containerr}>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr7.jpeg")}
                style={styles.circleImage}
              />
            </View>
            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr8.jpeg")}
                style={styles.circleImage}
              />
            </View>

            <View style={styles.circle}>
              <Image
                source={require("../assets/images/tr9.jpeg")}
                style={styles.circleImage}
              />
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
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  circleImage: {
    width: "100%",
    height: "100%",
  },
  textBelow: {
    marginTop: 10,
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
