import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Config from "./config.js";
import "../localization/i18n";
import axios from "axios";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
const LineDivider = () => {
  return (
    <View style={{ width: 1, paddingVertical: 5 }}>
      <View
        style={{
          flex: 1,
          borderLeftColor: "#EFEFF0",
          borderLeftWidth: 1,
        }}
      ></View>
    </View>
  );
};

const InformationScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const [client, setClient] = useState();
  const [membershipPrice, setMembershipPrice] = useState([]);

  const [scrollViewWholeHeight, setScrollViewWholeHeight] = React.useState(1);
  const [scrollViewVisibleHeight, setScrollViewVisibleHeight] =
    React.useState(0);

  const indicator = new Animated.Value(0);

  const getClient = () =>
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          console.log(token);
          Alert.alert(t("Session.session"), t("Session.finished"));
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: "{self{id, first_name, last_name, phone}}",
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
        }
        if (token) {
          return axios
            .post(
              `${Config.baseUrl}/client/graphql`,
              {
                query: `query GetMembership($id: ID!) {
                  Membership(id: $id) {
                    id
                    name
                    price
                    abilities
                    url
                    address
                  }
                }`,
                variables: {
                  id: id,
                },
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
              console.log(Membership);

              return setMembershipPrice(Membership);
            })

            .catch((error) => {
              Alert.alert(t("Session.session"), t("Session.finished"));
            });
        }
      })
      .catch(() => {
        Alert.alert(t("Session.session"), t("Session.finished"));
      });
  useEffect(() => {
    const delay = 300;

    const loadClientWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getClient();
    };
    const loadDataWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getAbonement();
    };

    loadClientWithDelay();
    loadDataWithDelay();
  }, []);

  function renderAbonementInfoSection() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={require("../assets/images/sports4.jpeg")}
          resizeMode="cover"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(241,242,233,0.8)",
          }}
        ></View>

        <View
          style={{
            alignItems: "flex-end",
            flexDirection: "row",
            paddingHorizontal: 13,
            height: 85,
          }}
        >
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/images/back_arrow_icon.png")}
              style={{
                width: 21,
                height: 21,
              }}
            />
          </TouchableOpacity>

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                color: "#000",
                fontFamily: "Raleway",
                fontSize: 17,
                fontWeight: "500",
              }}
            >
              {t("InformationScreen.about")}
            </Text>
          </View>
        </View>

        <View style={{ flex: 5, paddingTop: 42, alignItems: "center" }}>
          <Image
            source={require("../assets/images/Sports.png")}
            resizeMode="contain"
            style={{
              flex: 1,
              width: 150,
              height: "auto",
            }}
          />
        </View>

        <View
          style={{
            flex: 1.8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Raleway",
              fontSize: 18,
              fontWeight: "500",
            }}
          >
            {membershipPrice?.abilities
              ? membershipPrice.abilities
                  .map((ability) => ability.name)
                  .join(", ")
              : t("Session.finished")}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            paddingVertical: 21,
            margin: 25,
            borderRadius: 13,
            backgroundColor: "#BC2041",
          }}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Raleway",
                fontWeight: "700",
                fontSize: 17,
              }}
            >
              {membershipPrice?.address}
            </Text>
            <Text
              style={{
                color: "white",
                fontFamily: "Raleway",
                fontWeight: "400",
              }}
            >
              {t("InformationScreen.location")}
            </Text>
          </View>

          <LineDivider />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: "white",
                fontFamily: "Raleway",
                fontWeight: "800",
                fontSize: 19,
              }}
            >
              {membershipPrice?.price}
            </Text>
            <Text
              style={{
                color: "white",
                fontFamily: "Raleway",
                fontWeight: "400",
              }}
            >
              {t("InformationScreen.price")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  function renderAbonementDescription() {
    const indicatorSize =
      scrollViewWholeHeight > scrollViewVisibleHeight
        ? (scrollViewVisibleHeight * scrollViewVisibleHeight) /
          scrollViewWholeHeight
        : scrollViewVisibleHeight;

    const difference =
      scrollViewVisibleHeight > indicatorSize
        ? scrollViewVisibleHeight - indicatorSize
        : 1;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          padding: 24,
          backgroundColor: "#564C55",
        }}
      >
        <View style={{ width: 4, height: "100%" }}>
          <Animated.View
            style={{
              width: 4,
              height: indicatorSize,
              backgroundColor: "white",
              transform: [
                {
                  translateY: Animated.multiply(
                    indicator,
                    scrollViewVisibleHeight / scrollViewWholeHeight
                  ).interpolate({
                    inputRange: [0, difference],
                    outputRange: [0, difference],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingLeft: 36 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onContentSizeChange={(width, height) => {
            setScrollViewWholeHeight(height);
          }}
          onLayout={({
            nativeEvent: {
              layout: { x, y, width, height },
            },
          }) => {
            setScrollViewVisibleHeight(height);
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: indicator } } }],
            { useNativeDriver: false }
          )}
        >
          <Text
            style={{
              color: "white",
              marginBottom: 24,
              fontFamily: "Raleway",
              fontWeight: "700",
            }}
          >
            {t("InformationScreen.subscriptionDetails")}
          </Text>
          <Text style={{ color: "white" }}>
            <Text
              style={{
                color: "white",
                fontFamily: "Raleway",
                fontWeight: "400",
                fontSize: 16,
              }}
            >
              {membershipPrice?.abilities
                ? membershipPrice.abilities
                    .map((ability) => ability.description)
                    .join(", ")
                : "Інформація відсутня"}
            </Text>
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (client) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 4 }}>{renderAbonementInfoSection()}</View>

        <View style={{ flex: 2 }}>{renderAbonementDescription()}</View>
      </View>
    );
  } else {
    return <></>;
  }
};

export default InformationScreen;
