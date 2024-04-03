import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const HistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [membershipPrice, setMembershipPrice] = useState([]);
  const getAbonement = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert(t("Session.session"), t("Session.finished"));
          // return navigation.navigate("Login");
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: "{allMembershipLogs {id, start_date}}",
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
                  data: { allMembershipLogs },
                },
              } = res;

              console.log(allMembershipLogs);

              return setMembershipPrice(allMembershipLogs);
            })

            .catch((error) => {
              Alert.alert(t("Session.session"), t("Session.finished"));
              // return navigation.navigate("Login");
            });
        }
      })
      .catch(() => {
        Alert.alert(t("Session.session"), t("Session.finished"));
        // return navigation.navigate("Login");
      });
  useEffect(() => {
    const delay = 300;

    const loadDataWithDelays = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getAbonement();
    };
    loadDataWithDelays();
    getAbonement();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.containerBrands}>
            <View style={styles.topImage}>
              <Image
                style={styles.tinyLogo}
                source={require("../assets/images/gymLogo.png")}
              />
            </View>
            <View style={styles.topContainer}></View>
          </View>
          <View style={styles.bottomContainer}>
            <NavigationTabs />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  containerBrands: {
    backgroundColor: "white",
    alignItems: "center",
    height: "90%",
    width: "100%",
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  topImage: {
    height: "5%",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  tinyLogo: {
    marginTop: "2%",
    width: 180,
    height: 74,
  },
  topContainer: {
    width: "100%",
    height: "15%",
    alignItems: "center",
  },
  buttonContainer: {
    top: 40,
    width: "90%",
    height: "35%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#18AA5E",
    borderRadius: 6,
  },
});
