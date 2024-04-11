import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import NavigationTabs from "../Elements/NavigationTabs";
import { useTranslation } from "react-i18next";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Item = ({ allMemberships }) => {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <View style={styles.membershipContainer}>
        <View style={styles.containers}>
          <View>
            <Image
              source={{ uri: allMemberships.url }}
              style={styles.logoLoginScreen}
            />
          </View>

          <View
            style={{
              width: "10%",
              fontFamily: "Raleway",
              fontWeight: "500",
              color: "black",
            }}
          ></View>
          <View style={styles.textInBox}>
            <View
              style={{
                width: "100%",
                marginTop: "4%",
                fontFamily: "Raleway",

                height: "30%",
                color: "black",
              }}
            >
              <Text style={styles.nameAndPrice}>{allMemberships.name}</Text>
            </View>

            <Text style={styles.membershipAbilitiesContainer}>
              {allMemberships?.abilities
                ? allMemberships?.abilities
                    .map((ability) => ability.name)
                    .join(", ")
                : "Дані відсутні"}
            </Text>
            <Text style={styles.nameAndPrice}>{allMemberships.price}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
const AbonementListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [membershipPrice, setMembershipPrice] = useState([]);

  const openCard = (id) => {
    navigation.navigate("InformationScreen", { id });
  };

  const getAbonement = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert(t("Session.session"), t("Session.finished"));
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: "{allMemberships{id, name, price, abilities, url}}",
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
                  data: { allMemberships },
                },
              } = res;
              setMembershipPrice(allMemberships);
            })
            .catch((error) => {
              Alert.alert(t("Session.session"), t("Session.finished"));
              navigation.navigate("Login");
            });
        }
      })
      .catch(() => {
        Alert.alert(t("Session.session"), t("Session.finished"));
        navigation.navigate("Login");
      });

  useEffect(() => {
    const delay = 300;
    const loadAbonementWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getAbonement();
    };
    loadAbonementWithDelay();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openCard(item.id)}>
      <Item allMemberships={item} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <Text style={styles.textAbonement}> Список абонементів</Text>
          <View style={styles.containerList}>
            <FlatList
              data={membershipPrice}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <NavigationTabs />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AbonementListScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
    height: "100%",
  },

  containers: {
    padding: 10,
    backgroundColor: "#F1EBD8",
    borderRadius: 15,
    marginBottom: 15,
    display: "flex",
    flexDirection: "row",
    ap: 10,
  },
  containerBrands: {
    textAlign: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: "90%",
    marginTop: "3%",
    display: "flex",
  },

  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },

  containerList: {
    width: "100%",
    flex: 1,
    padding: 16,
    flexDirection: "column",
  },

  container: {
    flex: 1,
  },

  textAbonement: {
    fontFamily: "Raleway",
    fontWeight: "400",
    color: "black",
    fontSize: 22,
    marginTop: "5%",
    marginBottom: 10,
  },
  logoLoginScreen: {
    width: 100,
    height: 100,
    borderRadius: 15,
    resizeMode: "contain",
  },
  membershipAbilitiesContainer: {
    marginTop: "12%",
    fontFamily: "Raleway",
    fontWeight: "400",
  },
  textInBox: {
    width: "60%",
    height: "90%",
  },
  nameAndPrice: {
    fontFamily: "Raleway",
    fontWeight: "700",
    color: "black",
  },
});
