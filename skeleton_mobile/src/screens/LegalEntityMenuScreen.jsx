import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AntIcon from "react-native-vector-icons/AntDesign";
import LegalEntityNavigationTabs from "../Elements/LegalEntityNavigationTabs";
import { useTranslation } from "react-i18next";
import "../localization/i18n";

const MenuScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const openExit = () => {
    navigation.navigate("LegalEntityExit");
  };
  const openLegalEntity = () => {
    navigation.navigate("CardScreen");
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
          <View style={styles.menuList}>
            <View style={styles.exitContainer}>
              <TouchableOpacity style={styles.list} onPress={openLegalEntity}>
                <Icon
                  name="exchange-alt"
                  size={28}
                  color="#18aa5e"
                  marginLeft="4%"
                  justifyContent="space-between"
                />
                <Text style={styles.listText}>
                  {t("MenuScreen.legalEntity1")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exit} onPress={openExit}>
                <Icon
                  name="door-open"
                  size={28}
                  color="#636363"
                  marginRight="5%"
                  justifyContent="space-between"
                />
                <Text style={styles.exitText}>{t("MenuScreen.exit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <LegalEntityNavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    alignItems: "center",
    height: "90%",
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  logoLoginScreen: {
    width: 220,
    height: 29,
  },
  containerImg: {
    resizeMode: "contain",
    top: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  menuList: {
    height: "40%",
    width: "100%",
    top: "0.5%",
  },
  lineStyle: {
    borderWidth: 0.7,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "100%",
    margin: 10,
    top: "10%",
    marginLeft: "7%",
  },
  exit: {
    marginLeft: "7%",
    flexDirection: "row",
    top: "10%",
    alignItems: "center",
    padding: "5%",
  },
  exitContainer: {
    height: "30%",
    marginTop: "5%",
    marginRight: "30%",
  },
  exitText: {
    color: "black",
    top: "1%",
    fontWeight: "300",
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
  },
  list: {
    flexDirection: "row",
    top: "5%",
    alignItems: "center",
    padding: "5%",
    marginLeft: "5%",
  },
  listText: {
    color: "black",
    marginLeft: "5%",
    top: "0.5%",
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
  },
});
