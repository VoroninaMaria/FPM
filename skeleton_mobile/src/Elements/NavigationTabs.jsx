import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const NavigationTabs = () => {
  const navigation = useNavigation();

  const openHome = () => {
    navigation.navigate("CardScreen");
  };
  const openHistory = () => {
    navigation.navigate("History");
  };
  const openMenu = () => {
    navigation.navigate("Menu");
  };

  return (
    <View style={styles.footerContainer}>
      <Pressable style={styles.HomeButtonLeft} onPress={openHome}>
        <Icon name="home" size={31} color="#84739a" />
      </Pressable>
      <Pressable style={styles.HomeButtonCenter} onPress={openHistory}>
        <Icon name="history" size={31} color="black" />
      </Pressable>
      <Pressable style={styles.HomeButtonRight} onPress={openMenu}>
        <Icon name="bars" size={31} color="black" />
      </Pressable>
    </View>
  );
};

export default NavigationTabs;

const styles = StyleSheet.create({
  footerContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  HomeButtonLeft: {
    width: "33%",
    marginLeft: 30,
    flex: 1,
    alignItems: "flex-start",
  },
  HomeButtonCenter: {
    width: "33%",
    alignItems: "center",
  },
  HomeButtonRight: {
    width: "33%",
    flex: 1,
    marginRight: 30,
    alignItems: "flex-end",
  },
});
