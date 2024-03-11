import { StyleSheet } from "react-native";

// eslint-disable-next-line no-unused-vars
const buildStyles = ({ color, ...styles }) =>
  StyleSheet.create({
    Image: {
      width: "100%",
      height: "100%",
      ...styles,
    },
  });

export default buildStyles;
