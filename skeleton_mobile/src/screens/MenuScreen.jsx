import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AntIcon from "react-native-vector-icons/AntDesign";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../localization/i18n";

const MenuScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const openHome = () => {
    navigation.navigate("CardScreen");
  };
  const openSettings = () => {
    navigation.navigate("Settings");
  };
  const openProfile = () => {
    navigation.navigate("Profile");
  };
  const openSupport = () => {
    navigation.navigate("Support");
  };
  const openAbonement = () => {
    navigation.navigate("AbonementListScreen");
  };
  const openInfo = () => {
    navigation.navigate("InformationScreen");
  };

  const openExit = () => {
    navigation.navigate("Exit");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <View style={styles.containerImg}>
            <Image
              source={require("../assets/images/gymLogo.png")}
              style={styles.logoLoginScreen}
            />
          </View>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.list} onPress={openHome}>
              <Icon
                name="house-user"
                size={28}
                color="#f2cb84"
                marginLeft="4%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.home")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.list}
              onPress={() => {
                Linking.openURL("https://mango-oil.com.ua");
              }}
            >
              <Icon
                name="th-list"
                size={28}
                color="#f2cb84"
                marginLeft="4%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.site")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.list} onPress={openProfile}>
              <Icon
                name="user"
                size={28}
                color="#f2cb84"
                marginLeft="5%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.profile")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.list} onPress={openSettings}>
              <Icon
                name="sliders-h"
                size={25}
                color="#e6ab00"
                marginLeft="5%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.settings")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.list} onPress={openSupport}>
              <Icon
                name="headset"
                size={28}
                color="#f2cb84"
                marginLeft="5%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.support")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.list} onPress={openAbonement}>
              <Icon
                name="headset"
                size={28}
                color="#f2cb84"
                marginLeft="5%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("jjj")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.list} onPress={openInfo}>
              <Icon
                name="list"
                size={25}
                color="#e6ab00"
                marginLeft="5%"
                justifyContent="space-between"
              />
              <Text style={styles.listText}>{t("MenuScreen.settings")}</Text>
            </TouchableOpacity>

            <View style={styles.lineStyle} />
            <View style={styles.exitContainer}>
              <TouchableOpacity style={styles.exit} onPress={openExit}>
                <Icon
                  name="door-open"
                  size={28}
                  color="#e6ab00"
                  marginRight="5%"
                  justifyContent="space-between"
                />
                <Text style={styles.exitText}>{t("MenuScreen.exit")}</Text>
              </TouchableOpacity>
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

export default MenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
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
  text: {
    color: "white",
    fontSize: 30,
  },
  logoLoginScreen: {
    width: 180,
    height: 74,
  },
  containerImg: {
    resizeMode: "contain",
    top: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  menuList: {
    height: "40%",
    width: "90%",
    top: "0.5%",
  },
  list: {
    flexDirection: "row",
    matginTop: "5%",
    alignItems: "center",
    padding: "4%",
  },
  listText: {
    color: "#222222",
    marginLeft: "5%",
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
  },
  lineStyle: {
    borderWidth: 0.7,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "85%",
    margin: 10,
    top: "10%",

    marginLeft: "7%",
  },
  exit: {
    marginLeft: "10%",
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
    color: "#222222",
    top: "1%",
    fontWeight: "300",
    fontSize: 14,
  },
});
