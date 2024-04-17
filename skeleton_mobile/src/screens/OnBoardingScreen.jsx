import React from "react";
import {
  SafeAreaView,
  Image,
  StyleSheet,
  FlatList,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../assets/images/onBoard1.png"),
    title: "Ласкаво просимо!",
    subtitle:
      "У нашому клубі ми не лише займаємося фізичною активністю, а й формуємо справжніх чемпіонів та підтримуємо кожного у здоровому способі життя.",
  },
  {
    id: "2",
    image: require("../assets/images/onBoard2.png"),
    title: "Швидко та легко",
    subtitle: "Цей програмний додаток допоможе вам зберігати свій час",
  },
  {
    id: "3",
    image: require("../assets/images/onBoard3.png"),
    title: "Проста зміна даних",
    subtitle: "В додатку ви маєте змогу зміти свої дані для спорт клубу",
  },
];

const Slide = ({ item }) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={item?.image}
        style={{ height: "60%", width, resizeMode: "contain" }}
      />
      <View>
        <Text style={styles.title}>{item?.title}</Text>
        <Text style={styles.subtitle}>{item?.subtitle}</Text>
      </View>
    </View>
  );
};

const OnBoardingScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const ref = React.useRef();
  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };
  const openCard = () => {
    navigation.navigate("CardScreen");
  };
  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const skip = () => {
    const lastSlideIndex = slides.length - 1;
    const offset = lastSlideIndex * width;
    ref?.current.scrollToOffset({ offset });
    setCurrentSlideIndex(lastSlideIndex);
  };

  const Footer = () => {
    return (
      <View
        style={{
          height: height * 0.25,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex == index && {
                  backgroundColor: "white",
                  width: 25,
                },
              ]}
            />
          ))}
        </View>

        <View style={{ marginBottom: 20 }}>
          {currentSlideIndex == slides.length - 1 ? (
            <View style={{ height: 50 }}>
              <TouchableOpacity style={styles.btn} onPress={openCard}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 15,
                    color: "#945D87",
                    fontFamily: "Raleway",
                  }}
                >
                  РОЗПОЧНЕМО
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.btn,
                  {
                    borderColor: "#FEE3A2",
                    borderWidth: 1,
                    backgroundColor: "transparent",
                  },
                ]}
                onPress={skip}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    fontFamily: "Raleway",
                    color: "#FEE3A2",
                  }}
                >
                  ПРОПУСТИТИ
                </Text>
              </TouchableOpacity>
              <View style={{ width: 15 }} />
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={goToNextSlide}
                style={styles.btn}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#945D87",
                    fontFamily: "Raleway",
                  }}
                >
                  ДАЛІ
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <StatusBar style={styles.StatusBar} />
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height * 0.75 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    color: "white",
    fontSize: 13,
    marginTop: 10,
    width: 350,
    maxWidth: "70%",
    textAlign: "center",
    fontFamily: "Raleway",
    lineHeight: 23,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Raleway",
    marginTop: 20,
    textAlign: "center",
  },
  image: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  indicator: {
    height: 2.5,
    width: 10,
    backgroundColor: "grey",
    marginHorizontal: 3,
    borderRadius: 2,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#FEE3A2",
    justifyContent: "center",
    fontFamily: "Raleway",
    alignItems: "center",
  },
  SafeAreaView: {
    flex: 1,
    fontFamily: "Raleway",
    backgroundColor: "#9A7EA6",
  },
  StatusBar: {
    backgroundColor: "#9A7EA6",
  },
});
export default OnBoardingScreen;
