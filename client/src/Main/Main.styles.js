import { StyleSheet } from "react-native";

const StyleBuilder = (styles) =>
  StyleSheet.create({
    Main: {
      flex: 1,
      width: "100%",
      height: "100%",
      ...styles,
    },
  });

export default StyleBuilder;
