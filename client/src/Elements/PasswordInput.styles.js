import { StyleSheet } from "react-native";

const buildStyles = (styles) =>
  StyleSheet.create({
    inputText: {
      ...styles,
      width: `${styles.width}%`,
      height: `${styles.height}%`,
    },
  });

export default buildStyles;
