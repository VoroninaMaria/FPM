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
          height: "85%",

          justifyContent: "space-between",
          backgroundColor: "pink",
          borderColor: "red",
        }}
      >
        <View
          style={{
            width: "27%",
            alignItems: "flex-start",
            fontFamily: "Raleway",

            fontWeight: "500",
            color: "black",
            justifyContent: "center",
          }}
        >
          <Text style={styles.name}>{formattedStartDate}</Text>
        </View>
        <View
          style={{
            width: "25%",
            alignItems: "center",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "black",
            justifyContent: "center",
          }}
        >
          <Text style={styles.cost}>{formattedStartDate}</Text>
        </View>
        <View
          style={{
            width: "25%",
            alignItems: "flex-end",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "#18aa5e",
            justifyContent: "center",
          }}
        >
          <Text style={styles.costDi}>{formattedStartDate}</Text>
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
                source={require("../assets/images/gymLogo.png")}
              />
            </View>
            <View style={styles.containerr}>
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
    height: "5%",
    alignItems: "center",
  },
  containerr: {
    width: "100%",
    flex: 1,
    marginTop: "13%",
    padding: 10,
    flexDirection: "column",
    backgroundColor: "red",
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
  },
  name: {
    textAlign: "center",
    fontSize: 14,
    width: "70%",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    color: "black",
    marginLeft: "10%",
  },

  cost: {
    textAlign: "center",
    fontSize: 14,
    width: "70%",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    color: "black",
  },
  costDi: {
    textAlign: "center",
    fontSize: 14,
    width: "70%",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    color: "black",
  },
  discount: {
    textAlign: "center",
    fontSize: 14,
    width: "70%",
    height: "20%",
    fontWeight: "500",
    flex: 1,
    color: "black",
  },
});
