import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import LinearGradient from "react-native-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import LegalEntityNavigationTabs from "../Elements/LegalEntityNavigationTabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Config from "./config.js";
import { useTranslation } from "react-i18next";
import "../localization/i18n";

const LegalEntityScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [card, setCard] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const { t } = useTranslation();

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };
  const openFuel = () => {
    setShowQRCode(true);
  };

  const setCardInfo = async () => {
    await AsyncStorage.getItem("cardInfo").then((cardInfo) =>
      setCard(JSON.parse(cardInfo))
    );
  };

  const getJurCardInfo = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert(t("Session.session"), t("Session.finished"));
          return navigation.navigate("Login");
        }
        if (token) {
          AsyncStorage.getItem("userInfo").then((userInfo) => {
            const { codeEdroup, phoneNumber } = JSON.parse(userInfo);

            return axios
              .post(
                `${Config.baseUrl}/client/graphql`,
                {
                  query: `
                  query getJurCard($code_edroup: String!, $phone: String!) {
                    getJurQRCard(code_edroup: $code_edroup, phone: $phone) {
                      id, card_name, serial_external, pin1, balance
                    }
                  }
                `,
                  variables: {
                    code_edroup: codeEdroup,
                    phone: phoneNumber,
                  },
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then(async (res) => {
                if (res.data?.errors) {
                  return Alert.alert(
                    t("InputErrors.error"),
                    "Неправильно введено дані. Перевірте свою інформацію та повторіть спробу пізніше."
                  );
                }
                const {
                  data: {
                    data: { getJurQRCard },
                  },
                } = res;

                return setCard(getJurQRCard);
              })
              .catch(() => {
                return Alert.alert(t("InputErrors.error"), t("ErrorTXTDef"));
              });
          });
        }
      })
      .catch(async () => {
        await AsyncStorage.multiRemove(["cardInfo", "userInfo"]);
        return Alert.alert(t("Session.session"), t("Session.finished"));
      });

  useEffect(() => {
    setCardInfo();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getJurCardInfo();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
                source={require("../assets/images/horizontal_transp.png")}
                style={styles.logoLoginScreen}
              />
            </View>
            {showQRCode ? (
              <TouchableOpacity style={styles.qrCode} onPress={toggleQRCode}>
                <QRCode
                  value={card.serial_external}
                  size={195}
                  backgroundColor="white"
                />
                <Text style={styles.qrText}>pin-code: {card.pin1}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={openFuel}>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <Image
                      source={require("../assets/images/circle.png")}
                      style={styles.imageCard}
                    />
                  </View>
                  <View style={styles.cardButtom}>
                    <LinearGradient
                      colors={["#adf3f1", "#3bc0ff"]}
                      style={styles.linearGradient}
                    >
                      <Image
                        source={require("../assets/images/text_card.png")}
                        style={styles.textCard}
                      />
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={styles.cardText}>
                          {t("CardScreen.fuelCard")}
                        </Text>
                        <Text style={styles.cardNumber}>{card.card_name}</Text>
                      </View>
                      <View style={styles.balanceText}>
                        <Text
                          style={{
                            justifyContent: "flex-start",
                            marginLeft: "5%",
                            fontSize: 17,
                            fontWeight: "700",
                            color: "black",
                            fontFamily: "Inter",
                          }}
                        >
                          {t("CardScreen.balance")}
                        </Text>
                        <Text
                          style={{
                            justifyContent: "flex-end",
                            marginRight: "5%",
                            fontSize: 17,
                            fontWeight: "700",
                            fontFamily: "Inter",
                            color: "black",
                          }}
                        >
                          {card.balance} {t("CardScreen.currencyBalance")}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.bottomContainer}>
            <LegalEntityNavigationTabs />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalEntityScreen;

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
    marginTop: "5%",
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
    width: 220,
    height: 29,
  },
  card: {
    marginTop: "5%",
    width: "90%",
    height: "57%",
    overflow: "hidden",
    position: "relative",
    left: "5.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
  },
  cardTop: {
    width: "100%",
    flex: 1,
  },
  cardButtom: {
    width: "100%",
    flex: 1,
  },
  cardNumber: {
    color: "black",
    fontWeight: "500",
  },
  linearGradient: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  imageCard: {
    flex: 1,
    width: 250,
    height: 71.08,
    left: "15%",
    resizeMode: "contain",
  },
  textCard: {
    marginTop: "1%",
    width: "50%",
    height: "20%",
    resizeMode: "contain",
  },
  cardText: {
    fontWeight: "500",
    fontSize: 16,
    color: "black",
  },
  cardNomer: {
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
  qrCode: {
    alignItems: "center",
    marginTop: 20,
  },
  qrText: {
    marginTop: "2%",
    color: "black",
    fontWeight: "500",
  },
});
