import { StyleSheet } from "react-native";

const buildStyles = (styles) =>
  StyleSheet.create({
    Text: {
      ...styles,
    },
  });

export default buildStyles;
