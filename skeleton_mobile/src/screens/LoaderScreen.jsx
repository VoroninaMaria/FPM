import { Image, View, StyleSheet, SafeAreaView } from "react-native";

const LoaderScreen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <View style={styles.containerImg}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoLoginScreen}
        />
      </View>
    </View>
  </SafeAreaView>
);

export default LoaderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  containerImg: {
    alignItems: "center",
    resizeMode: "cover",
  },
  logoLoginScreen: {
    width: 250,
    height: 150,
  },
});
