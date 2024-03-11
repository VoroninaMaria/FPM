import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
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
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useTranslation();
  const [fuelTransactions, setFuelTransactions] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [transactions, setTransactions] = useState([
    ...paymentTransactions,
    ...fuelTransactions,
  ]);
  const [isAllActive, setIsAllActive] = useState(true);
  const [isTopupActive, setIsTopupActive] = useState(false);
  const [isChargedActive, setIsChargedActive] = useState(false);

  const getTransactions = () =>
    AsyncStorage.getItem("token")
      .then(async (token) => {
        const ft = await axios
          .post(
            `${Config.baseUrl}/client/graphql`,
            {
              query:
                "{allTransactions {id, n_vid_trans, n_service_station, tr_fn_clients, ss_fn_clients, fn_card_owner, n_accounts_struc, price, amount, sum, session_time}}",
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
                data: { allTransactions },
              },
            } = res;

            setFuelTransactions(allTransactions);

            return allTransactions;
          })
          .catch(() => {
            Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
            return navigation.navigate("Login");
          });

        const pt = await axios
          .post(
            `${Config.baseUrl}/client/graphql`,
            {
              query:
                "{allPaymentTransactions {id_docums, session_time, s_docums, payment_note, client_fn}}",
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
                data: { allPaymentTransactions },
              },
            } = res;

            setPaymentTransactions(allPaymentTransactions);

            return allPaymentTransactions;
          })
          .catch(() => {
            Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
            return navigation.navigate("Login");
          });

        return setTransactions([...pt, ...ft]);
      })
      .catch(() => {
        Alert.alert(t("Session.session"), t("Session.finished"));
        return navigation.navigate("Login");
      });

  useEffect(() => {
    getTransactions();
  }, []);

  const showAllTransactions = () => {
    setIsChargedActive(false);
    setIsTopupActive(false);
    setIsAllActive(true);

    getTransactions();

    return setTransactions([...paymentTransactions, ...fuelTransactions]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    showAllTransactions();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const ItemTopup = ({ transactions }) => {
    if (transactions?.id_docums) {
      const formattedDate = moment(transactions.session_time).format(
        "DD.MM.YYYY HH:mm"
      );

      return (
        <View style={styles.itemTop}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.typeNAz}>{transactions.client_fn}</Text>
            <Text style={styles.type}>{transactions.payment_note}</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              marginRight: 5,
              marginBottom: 5,
            }}
          >
            <Text style={styles.summ}>{`+${transactions.s_docums} ₴`}</Text>
            <Text style={styles.dateTop}>{formattedDate}</Text>
          </View>
        </View>
      );
    } else {
      const formattedDate = moment(transactions.session_time).format(
        "DD.MM.YYYY HH:mm"
      );

      return (
        <View style={styles.item}>
          <View style={{ flexDirection: "column" }}>
            {/* <Text style={styles.typeNAz}>{transactions.ss_fn_clients}</Text>*/}
            <Text style={[styles.type, { marginTop: 10 }]}>
              {transactions.n_service_station}
            </Text>
            <Text style={styles.type}>{transactions.n_accounts_struc}</Text>
            <Text style={styles.type}>{transactions.price} грн/л</Text>
            <Text style={styles.type}>{transactions.amount} літрів</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              marginRight: 5,
              marginBottom: 10,
            }}
          >
            <Text
              style={[styles.summ, { color: "#E61E25" }]}
            >{`-${transactions.sum} ₴`}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
      );
    }
  };
  const renderItem = ({ item }) => <ItemTopup transactions={item} />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.containerBrands}>
            <View style={styles.topImage}>
              <Image
                style={styles.tinyLogo}
                source={require("../assets/images/horizontal_transp.png")}
              />
            </View>
            <View style={styles.topContainer}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.allTrns,
                    { backgroundColor: isAllActive ? "#18AA5E" : "white" },
                  ]}
                  onPress={showAllTransactions}
                >
                  <Text style={{ color: isAllActive ? "#FFFFFF" : "#18AA5E" }}>
                    {t("HisrotyScreen.allTransactions")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.topupTrns}
                  style={[
                    styles.topupTrns,
                    { backgroundColor: isTopupActive ? "#18AA5E" : "white" },
                  ]}
                  onPress={() => {
                    setIsTopupActive(true);
                    setIsChargedActive(false);
                    setIsAllActive(false);
                    return setTransactions(paymentTransactions);
                  }}
                >
                  <Text
                    style={{ color: isTopupActive ? "#FFFFFF" : "#18AA5E" }}
                  >
                    {t("HisrotyScreen.topUp")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chargingTrns,
                    { backgroundColor: isChargedActive ? "#18AA5E" : "white" },
                  ]}
                  onPress={() => {
                    setIsChargedActive(true);
                    setIsTopupActive(false);
                    setIsAllActive(false);
                    return setTransactions(fuelTransactions);
                  }}
                >
                  <Text
                    style={{ color: isChargedActive ? "#FFFFFF" : "#18AA5E" }}
                  >
                    {t("HisrotyScreen.writingOff")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.transactionContainer}>
              {transactions.length != 0 ? (
                <FlatList
                  data={transactions
                    .flat()
                    .sort((a, b) =>
                      b.session_time.localeCompare(a.session_time)
                    )}
                  renderItem={renderItem}
                  keyExtractor={(item) => (item.id ? item.id : item.id_docums)}
                />
              ) : (
                <Text style={styles.noTransactions}>
                  {t("HisrotyScreen.null")}
                </Text>
              )}
            </View>
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
    marginTop: 25,
    width: 230,
    height: 29,
    resizeMode: "contain",
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
  allTrns: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "33%",
  },
  topupTrns: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "33%",
    backgroundColor: "white",
  },
  chargingTrns: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "33%",
  },
  topupTrnsText: {
    color: "#18AA5E",
  },
  transactionContainer: {
    width: "100%",
    height: "80%",
    alignItems: "center",
  },
  item: {
    width: 350,
    height: 170,
    marginBottom: "3%",
    padding: "1%",
    backgroundColor: "white",
    borderColor: "#E61E25",
    borderWidth: 1,
    borderRadius: 6,
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTop: {
    width: 350,
    height: 70,
    marginBottom: "3%",
    backgroundColor: "white",
    borderColor: "#18AA5E",
    borderWidth: 1,
    borderRadius: 6,
    shadowColor: "rgba(24, 170, 94, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
    fontFamily: "Raleway",
    alignItems: "flex-start",
    color: "#696969",
  },
  typeNAz: {
    marginTop: "7%",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
    fontFamily: "Raleway",
    alignItems: "flex-start",
    color: "black",
  },
  dateContainer: {
    marginTop: 5,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    color: "#909090",
  },
  date: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 12,
    textAlign: "right",
    color: "#909090",
  },
  dateTop: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 12,
    marginBottom: 5,
    textAlign: "right",
    color: "#909090",
  },
  summ: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    marginRight: 10,
    flex: 1,
    color: "#18AA5E",
    alignItems: "flex-end",
  },
  noTransactions: {
    textAlign: "center",
    fontFamily: "Raleway",
    marginTop: "50%",
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
});
