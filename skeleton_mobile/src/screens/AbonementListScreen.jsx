import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import LinearGradient from "react-native-linear-gradient";
import NavigationTabs from "../Elements/NavigationTabs";
import { useNavigation } from "@react-navigation/native";
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
        <View style={styles.membershipDetailContainer}>
          <View
            style={{
              width: "25%",
              alignItems: "flex-start",
              fontFamily: "Raleway",
              fontWeight: "500",
              color: "black",
              justifyContent: "center",
            }}
          >
            <Text style={styles.name}>{allMemberships.price}</Text>
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
            <Text style={styles.cost}>{allMemberships.name}</Text>
          </View>
          <View style={styles.membershipAbilitiesContainer}>
            {allMemberships.abilities.map((ability, index) => (
              <Text key={index} style={styles.membershipAbility}>
                {ability.name}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.lineStyle} />
      </View>
    </ScrollView>
  );
};
const AbonementListScreen = ({ navigation }) => {
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
                query: "{allMemberships{id, name, price, abilities}}",
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
              console.log(allMemberships);

              return setMembershipPrice(allMemberships);
            })

            .catch((error) => {
              Alert.alert(t("Session.session"), t("Session.finished"));
              return navigation.navigate("Login");
            });
        }
      })
      .catch(() => {
        Alert.alert(t("Session.session"), t("Session.finished"));
        return navigation.navigate("Login");
      });
  useEffect(() => {
    const delay = 300;

    const loadClientWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getAbonement();
    };

    loadClientWithDelay();
  }, []);
  const renderItem = ({ item }) => <Item allMemberships={item} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerBrands}>
          <Text style={styles.textAbonement}></Text>

          <View style={styles.containerr}>
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
    backgroundColor: "white",
  },

  containerBrands: {
    textAlign: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: "90%",
    marginTop: "3%",
    display: "flex",
  },
  textAbonement: {
    fontSize: 25,
    fontFamily: "Outfit-medium",
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
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    flexDirection: "row",
    justifyContent: "space-between",
    color: "black",
  },
  containerr: {
    width: "100%",
    flex: 1,
    padding: 16,
    flexDirection: "column",
  },
  topContainer: {
    width: "100%",
    height: "90%",
  },
  middleContainer: {
    width: "100%",
    height: "50%",
    marginTop: 30,
  },
  bottomContainer: {
    flex: 1,
    width: "100%",
    height: "10%",
    backgroundColor: "#F5F5F5",
  },
  membershipContainer: {
    flexDirection: "column",
    marginVertical: 10,
  },
  membershipDetailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  membershipName: {
    fontFamily: "Raleway",
    fontWeight: "500",
    color: "black",
  },
  membershipPrice: {
    fontFamily: "Raleway",
    fontWeight: "500",
    color: "black",
  },
  membershipAbilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  membershipAbility: {
    fontFamily: "Raleway",
    fontWeight: "500",
    color: "#18aa5e",
    marginVertical: 5,
    marginHorizontal: 5,
  },
  lineStyle: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginVertical: 10,
  },
  container: {
    flex: 1,
  },
  containerBrands: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textAbonement: {
    fontFamily: "Raleway",
    fontWeight: "500",
    color: "black",
    fontSize: 20,
    marginBottom: 10,
  },
});
