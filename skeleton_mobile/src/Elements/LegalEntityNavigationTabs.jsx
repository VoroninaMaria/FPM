import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const LegalEntityNavigationTabs = () => {
  const navigation = useNavigation();

  const openHome = () => {
    navigation.navigate("LegalEntity");
  };
  const openMenu = () => {
    navigation.navigate("LegalEntityMenu");
  };

  return (
    <View style={styles.footerContainer}>
      <Pressable style={styles.HomeButtonLeft} onPress={openHome}>
        <Icon name="home" size={30} color="#18aa5e" />
      </Pressable>
      <Pressable style={styles.HomeButtonRight} onPress={openMenu}>
        <Icon name="bars" size={30} color="grey" />
      </Pressable>
    </View>
  );
};

export default LegalEntityNavigationTabs;

const styles = StyleSheet.create({
  footerContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  HomeButtonLeft: {
    width: "50%",
    marginLeft: 30,
    flex: 1,
    alignItems: "center",
  },
  HomeButtonRight: {
    width: "50%",
    flex: 1,
    marginRight: 30,
    alignItems: "center",
  },
});
