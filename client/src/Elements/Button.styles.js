import { StyleSheet } from "react-native";

const buildStyles = (styles) =>
  StyleSheet.create({
    Input: {
      width: `${styles.width}%`,
      height: `${styles.height}%`,
      ...styles,
    },
    Text: {
      color: styles.color,
      textAlign: styles.textAlign,
      width: `${styles.width}%`,
      height: `${styles.height}%`,
      ...styles,
    },
  });

export default buildStyles;
