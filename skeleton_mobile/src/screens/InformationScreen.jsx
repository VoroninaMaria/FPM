import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
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

const BookDetail = ({ item, navigation }) => {
  const [client, setClient] = useState();
  // const { item } = route.params;

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
          // return navigation.navigate("Login");
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

              console.log(self);

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
  useEffect(() => {
    const delay = 300;

    const loadClientWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      getClient();
    };

    loadClientWithDelay();
  }, []);

  function renderBookInfoSection() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={require("../assets/images/other_words_for_home.jpg")}
          resizeMode="cover"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        {/* Color Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(240,240,232,0.9)",
          }}
        ></View>

        {/* Navigation header */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 12,
            height: 80,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ marginLeft: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/images/back_arrow_icon.png")}
              style={{
                width: 20,
                height: 20,
              }}
            />
          </TouchableOpacity>

          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#000" }}>Book Detail</Text>
          </View>

          <TouchableOpacity
            style={{ marginRigth: 8 }}
            onPress={() => console.log("Click More")}
          >
            <Image
              source={"../assets/images/back_arrow_icon.png"}
              resizeMode="contain"
              style={{
                width: 30,
                height: 30,
                tintColor: "#000",
                alignSelf: "flex-end",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Book Cover */}
        <View style={{ flex: 5, paddingTop: 36, alignItems: "center" }}>
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

        {/* Book Name and Author */}
        <View
          style={{ flex: 1.8, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#000" }}>{client?.last_name.toString()}</Text>
          <Text style={{ color: "#000" }}>{client?.last_name.toString()}</Text>
        </View>

        {/* Book Info */}
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 20,
            margin: 24,
            borderRadius: 12,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          {/* Rating */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "white" }}>
              {client?.last_name.toString()}
            </Text>
            <Text style={{ color: "white" }}>Rating</Text>
          </View>

          <LineDivider />

          {/* Pages */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>
              {client?.last_name.toString()}
            </Text>
            <Text style={{ color: "white" }}>Number of Page</Text>
          </View>

          <LineDivider />

          {/* Language */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "white" }}>
              {client?.last_name.toString()}
            </Text>
            <Text style={{ color: "white" }}>Language</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderBookDescription() {
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
      <View style={{ flex: 1, flexDirection: "row", padding: 24 }}>
        {/* Custom Scrollbar */}
        <View style={{ width: 4, height: "100%", backgroundColor: "gray" }}>
          <Animated.View
            style={{
              width: 4,
              height: indicatorSize,
              backgroundColor: "#7D7E84",
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

        {/* Description */}
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
            }}
          >
            Description
          </Text>
          <Text style={{ color: "#64676D" }}>
            {client?.last_name.toString()}
          </Text>
        </ScrollView>
      </View>
    );
  }

  function renderBottomButton() {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Bookmark */}
        <TouchableOpacity
          style={{
            width: 60,
            backgroundColor: "#25282F",
            marginLeft: 24,
            marginVertical: 8,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => console.log("Bookmark")}
        >
          <Image
            source={"../assets/images/back_arrow_icon.png"}
            resizeMode="contain"
            style={{
              width: 25,
              height: 25,
              tintColor: "#EFEFF0",
            }}
          />
        </TouchableOpacity>

        {/* Start Reading */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#F96D41",
            marginHorizontal: 8,
            marginVertical: 8,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => console.log("Start Reading")}
        >
          <Text style={{ color: "white" }}>Start Reading</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (client) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {/* Book Cover Section */}
        <View style={{ flex: 4 }}>{renderBookInfoSection()}</View>

        {/* Description */}
        <View style={{ flex: 2 }}>{renderBookDescription()}</View>

        {/* Buttons */}
        <View style={{ height: 70, marginBottom: 30 }}>
          {renderBottomButton()}
        </View>
      </View>
    );
  } else {
    return <></>;
  }
};

export default BookDetail;
