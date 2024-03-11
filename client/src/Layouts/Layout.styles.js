import { StyleSheet } from "react-native";

const StyleBuilder = (styles) =>
  StyleSheet.create({
    Layout: {
      flex: 1,
      width: "100%",
      ...styles,
    },
  });

export default StyleBuilder;
