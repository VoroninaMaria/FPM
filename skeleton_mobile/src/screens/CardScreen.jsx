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
import moment from "moment";

const Item = ({ abonements }) => {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <View
        style={{
          flexDirection: "row",
          width: "100%",

          height: "55%",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "30%",
            alignItems: "flex-start",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "black",
            justifyContent: "center",
          }}
        >
          <Text style={styles.name}>{abonements.name}</Text>
        </View>
        <View
          style={{
            width: "30%",
            alignItems: "center",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "black",

            justifyContent: "center",
          }}
        >
          <Text style={styles.cost}>{abonements.description1}</Text>
        </View>
        <View
          style={{
            width: "30%",
            fontSize: 12,
            alignItems: "flex-end",
            fontFamily: "Raleway",
            fontWeight: "500",
            color: "#18aa5e",
            marginLeft: 20,
            justifyContent: "center",
          }}
        >
          <Text style={styles.costDi}>{abonements.description2}</Text>
        </View>
      </View>
      <View style={styles.lineStyle} />
    </ScrollView>
  );
};
//   const { t } = useTranslation();

//   return (
//     <ScrollView>
//       <View
//         style={{
//           flexDirection: "row",
//           width: "100%",
//           height: "35%",
//           justifyContent: "space-between",
//         }}
//       >
//         <View
//           style={{
//             width: "25%",
//             alignItems: "flex-start",
//             fontFamily: "Raleway",
//             fontWeight: "500",
//             color: "black",
//             justifyContent: "center",
//           }}
//         >
//           <Text style={styles.name}>{stella.name}</Text>
//         </View>
//         <View
//           style={{
//             width: "25%",
//             alignItems: "center",
//             fontFamily: "Raleway",
//             fontWeight: "500",
//             color: "black",
//             justifyContent: "center",
//           }}
//         >
//           <Text style={styles.cost}>{stella.regular_price / 100}</Text>
//         </View>
//         <View
//           style={{
//             width: "25%",
//             alignItems: "flex-end",
//             fontFamily: "Raleway",
//             fontWeight: "500",
//             color: "#18aa5e",
//             justifyContent: "center",
//           }}
//         >
//           <Text style={styles.costDi}>{stella.discount_price / 100}</Text>
//         </View>
//         <View
//           style={{
//             width: "25%",
//             alignItems: "flex-end",
//             fontFamily: "Raleway",
//             fontWeight: "500",
//             color: "#18aa5e",
//             justifyContent: "center",
//           }}
//         >
//           <Text style={styles.discount}>
//             {(stella.regular_price - stella.discount_price) / 100}
//           </Text>
//         </View>
//       </View>
//       <View style={styles.lineStyle} />
//     </ScrollView>
//   );
// };

const CardScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const [membershipPrice, setMembershipPrice] = useState([]);
  const [card, setCard] = useState();
  const [client, setClient] = useState();

  const getClient = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          console.log(token);
          Alert.alert(t("Session.session"), t("Session.finished"));
          // return navigation.navigate("Login");
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: "{self{id, first_name, last_name, phone, membership}}",
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
                  data: { self },
                },
              } = res;

              return setClient(self);
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
                query:
                  "{Membership{id, name, price, abilities, url, description1, description2}}",
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
                  data: { Membership },
                },
              } = res;

              // console.log(Membership);

              return setMembershipPrice(Membership.abilities);
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

    const loadClientWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getClient();
    };
    const loadDataWithDelays = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getAbonement();
    };
    loadDataWithDelays();
    loadClientWithDelay();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getClient();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleQRCode = () => {
    setShowInfo(!showInfo);
  };
  const openFuel = () => {
    setShowInfo(true);
  };

  const navigation = useNavigation();

  const openPartners = () => {
    navigation.navigate("Partners");
  };

  const openAbonement = () => {
    navigation.navigate("AbonementListScreen");
  };

  const renderItem = ({ item }) => <Item abonements={item} />;
  const formattedStartDate = client?.membership?.[0]?.start_date
    ? moment(client.membership[0].start_date).format("DD.MM.YYYY HH:mm")
    : null;

  const formattedEndDate = client?.membership?.[0]?.end_date
    ? moment(client.membership[0].end_date).format("DD.MM.YYYY HH:mm")
    : null;
  const handleActivationPress = async () => {
    return AsyncStorage.getItem("token").then((token) => {
      return axios.post(
        `${Config.baseUrl}/client/graphql`,
        {
          query: `
        mutation changeMembershipStatus($status: String!) {
          changeMembershipStatus(status: $status) {
            id
          }
        }
      `,
          variables: {
            status: "active",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.topContainer}>
            <View style={styles.containerImg}>
              <Image
                source={require("../assets/images/Sports.png")}
                style={styles.logoLoginScreen}
              />
            </View>
            {showInfo ? (
              <TouchableOpacity style={styles.qrCode} onPress={toggleQRCode}>
                <Text style={styles.qrText}>
                  {t("CardScreen.start_date")} {formattedStartDate}
                </Text>
                <Text style={styles.qrText}>
                  {t("CardScreen.end_date")} {formattedEndDate}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={openFuel}>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View>
                      <Image
                        source={require("../assets/images/logoCard.png")}
                        style={styles.imageCard}
                      />
                    </View>
                    <View
                      style={{
                        marginLeft: "0%",
                        marginTop: "2%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          fontFamily: "Inter",
                          color: "black",
                          textAlign: "center",
                        }}
                      >
                        {client?.first_name.toString()}
                      </Text>

                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 15,
                          fontWeight: "700",
                          fontFamily: "Inter",
                          color: "black",
                          marginTop: "10%",
                          marginLeft: "5%",
                        }}
                      >
                        {client?.last_name.toString()}
                      </Text>
                      <Text
                        style={{
                          marginRight: "5%",
                          fontSize: 14,
                          marginTop: "10%",
                          fontWeight: "400",
                          fontFamily: "Inter",
                          color: "black",
                        }}
                      >
                        {client?.phone.toString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardButtom}>
                    <LinearGradient
                      colors={[
                        "rgba(246,199,112,0.8813900560224089)",
                        "rgba(241,201,85,0.6965161064425771)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.linearGradient}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          marginTop: "2%",
                          justifyContent: "space-between",
                        }}
                      ></View>
                      <View
                        style={{
                          alignItems: "center",
                          marginTop: "0%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.abonementName}>
                          {client?.membership?.[0]?.name ?? null}
                        </Text>
                        <View style={styles.activationText}>
                          <Text style={styles.activationStatus}>
                            {t("CardScreen.status")}
                          </Text>
                          <Text style={styles.statusAct}>
                            {client?.membership?.[0]?.status ?? null}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            <View style={styles.buttonCard}>
              <TouchableOpacity style={styles.topup} onPress={openAbonement}>
                <Text style={styles.topupText}>{t("CardScreen.topUp")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.partner}
                onPress={handleActivationPress}
              >
                <Text style={styles.partnerText}>
                  {t("CardScreen.gallery")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.middleContainer}>
              <Text style={styles.fuelPrices}>
                {t("CardScreen.subscriptionPrices")}
              </Text>

              <View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "98%",
                    marginTop: "5%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      alignItems: "flex-start",
                      fontFamily: "Raleway",
                      fontWeight: "500",
                      color: "black",
                      marginLeft: "5%",
                    }}
                  >
                    {t("CardScreen.type")}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      alignItems: "center",
                      fontFamily: "Raleway",
                      fontWeight: "500",
                      color: "black",
                    }}
                  >
                    {t("CardScreen.not_disc")}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      alignItems: "flex-end",
                      fontFamily: "Raleway",
                      fontWeight: "500",
                      color: "black",
                    }}
                  >
                    {t("CardScreen.date")}
                  </Text>
                </View>
                <View style={styles.lineStyle} />
              </View>
              <View style={styles.containerr}>
                <FlatList
                  data={client?.membership?.[0]?.abilities ?? null}
                  renderItem={renderItem}
                  keyExtractor={(item) => item?.id ?? null}
                />
              </View>
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

export default CardScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
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
  containerImg: {
    alignItems: "center",
    resizeMode: "contain",
    top: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoLoginScreen: {
    width: 300,
    height: 50,
    resizeMode: "contain",
  },
  card: {
    width: "90%",
    height: 220,
    overflow: "hidden",
    position: "relative",
    left: "5.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
  },
  cardTop: {
    marginTop: "6%",
    width: "80%",
    height: "80%",
    flex: 1,
    flexDirection: "row",
  },
  cardButtom: {
    width: "100%",
    flex: 1,
  },
  linearGradient: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  imageCard: {
    flex: 1,
    width: 230,
    justifyContent: "center",
    height: 90,
  },
  abonementName: {
    fontWeight: "700",
    fontSize: 16,
    color: "black",
    fontFamily: "Outfit",
  },
  textCard: {
    marginTop: "1%",
    width: "22%",
    height: "30%",
  },
  cardText: {
    fontWeight: "500",
    fontSize: 16,
    color: "black",
  },
  cardNumber: {
    fontWeight: "400",
    fontSize: 14,
    color: "black",
  },
  balanceText: {
    marginTop: "3%",
    flexDirection: "row",
    width: "100%",

    justifyContent: "space-between",
  },
  buttonCard: {
    flexDirection: "row",
    top: "5%",
  },
  topup: {
    width: "42%",
    height: "100%",
    marginLeft: "5%",
    padding: "3%",
    backgroundColor: "#f2cb84",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e6ab00",
  },
  topupText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  partner: {
    width: "42%",
    height: "100%",
    marginLeft: "5%",
    padding: "3%",
    backgroundColor: "white",
    borderColor: "#f2cb84",
    borderWidth: 1,
    borderRadius: 6,
    shadowColor: "rgba(246,199,112,0.26514355742296913)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  partnerText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  fuelPrices: {
    textAlign: "center",
    fontFamily: "Raleway",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  containerr: {
    width: "100%",
    flex: 1,
    padding: 10,
    flexDirection: "column",
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
    fontSize: 15,

    fontWeight: "500",
    flex: 1,
    marginTop: "15%",
    color: "black",
  },

  cost: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,

    color: "black",

    marginTop: "15%",
  },
  costDi: {
    textAlign: "center",
    alignItems: "center",
    fontSize: 15,
    fontWeight: "500",
    flex: 2,
    color: "#e6ab00",
    marginTop: "15%",
  },

  qrCode: {
    width: "90%",
    height: 220,
    overflow: "hidden",
    position: "relative",
    left: "5.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: {
    color: "black",
    marginTop: "2%",
    fontSize: 15,
    fontWeight: "500",
    position: "relative",
    fontFamily: "Outfit",
  },
  lineStyle: {
    borderWidth: 0.7,
    borderColor: "rgba(226, 226, 226, 1)",
    width: "100%",
    marginTop: "5%",
  },
  priceSer: {
    textAlign: "center",
    fontFamily: "Raleway",
    fontSize: 10,
    fontWeight: "bold",
    color: "#18aa5e",
    marginTop: "2%",
  },
  activationText: {
    marginTop: "4%",
    flexDirection: "row",
  },
  activationStatus: {
    fontFamily: "Raleway",
    fontSize: 15,
  },
  statusAct: {
    fontFamily: "Raleway",
    fontSize: 15,
    fontWeight: "bold",
  },
});
