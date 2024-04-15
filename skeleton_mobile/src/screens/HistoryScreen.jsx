import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import NavigationTabs from "../Elements/NavigationTabs";

import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
const Item = ({ abonements }) => {
  const { t } = useTranslation();
  const formattedStartDate = abonements.start_date
    ? moment(abonements.start_date).format("DD.MM.YYYY HH:mm")
    : null;
  console.log(formattedStartDate);
  const formattedEndDate = abonements.end_date
    ? moment(abonements.end_date).format("DD.MM.YYYY HH:mm")
    : null;

  return (
    <ScrollView>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          height: "100%",
          marginTop: "0%",
          borderWidth: 0.4,
          justifyContent: "center",
          justifyContent: "space-between",
          backgroundColor: "#e9dcd8",
          borderColor: "#cbb7c3",
        }}
      >
        <View
          style={{
            width: "33%",
            fontFamily: "Raleway",
            alignItems: "center",
            fontWeight: "500",

            color: "#18aa5e",
            justifyContent: "center",
          }}
        >
          <Text style={styles.name}>{abonements.name}</Text>
        </View>
        <View
          style={{
            width: "33%",

            color: "black",

            alignItems: "center",
          }}
        >
          <Text style={styles.name}>{formattedStartDate}</Text>
        </View>
        <View
          style={{
            width: "33%",
            alignItems: "center",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "black",

            justifyContent: "center",
          }}
        >
          <Text style={styles.name}>{formattedEndDate}</Text>
        </View>
      </View>
      <View style={styles.lineStyle} />
    </ScrollView>
  );
};
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
                query: "{allMembershipLogs {id, start_date, end_date, name}}",
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
  const renderItem = ({ item }) => <Item abonements={item} />;
  const formattedStartDate = setMembershipPrice.start_date
    ? moment(setMembershipPrice.start_date).format("DD.MM.YYYY HH:mm")
    : null;
  console.log(formattedStartDate);
  const formattedEndDate = setMembershipPrice.end_date
    ? moment(setMembershipPrice.end_date).format("DD.MM.YYYY HH:mm")
    : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.containerBrands}>
            <View style={styles.topImage}>
              <Image
                style={styles.tinyLogo}
                source={require("../assets/images/Sports.png")}
              />
            </View>

            <View style={styles.containerList}>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "90%",
                    marginTop: "4%",
                    marginHorizontal: "4%",

                    marginBottom: "4%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Raleway",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    {t("CardScreen.type")}
                  </Text>

                  <Text
                    style={{
                      fontFamily: "Raleway",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    {t("HisrotyScreen.start_date")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Raleway",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    {t("HisrotyScreen.end_date")}
                  </Text>
                </View>
                <View style={styles.lineStyle} />
              </View>
              <FlatList
                data={membershipPrice}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
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
  },
  tinyLogo: {
    marginTop: "10%",
    width: "32%",
    height: "100%",
  },
  topContainer: {
    width: "100%",
    height: "5%",
    alignItems: "center",
  },
  containerList: {
    width: "100%",
    flex: 1,
    marginTop: "13%",
    padding: 10,
    flexDirection: "column",
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
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    flexDirection: "row",
    justifyContent: "space-between",

    color: "black",
    fontFamily: "Raleway",
  },
  name: {
    textAlign: "center",
    fontSize: 14,
    padding: "7%",
    width: "100%",
    fontFamily: "Raleway",
    fontWeight: "500",
    flex: 1,
    color: "black",
    fontFamily: "Raleway",
    fontWeight: "400",
    marginTop: "0%",
  },

  cost: {
    textAlign: "center",
    fontSize: 14,
    width: "100%",
    height: "20%",
    fontWeight: "500",
    marginTop: "5%",
    flex: 1,
    fontFamily: "Raleway",
    color: "black",
  },
  costDi: {
    fontSize: 17,
    width: "100%",
    fontFamily: "Raleway",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    marginTop: "5%",
    textAlign: "center",
    justifyContent: "center",
    color: "black",
  },
  discount: {
    fontSize: 14,
    width: "70%",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    color: "black",
  },
});
