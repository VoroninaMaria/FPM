import { View as NativeView } from "react-native";

const View = ({ size, blocks = 1, styles, children }) => (
  <NativeView
    style={{
      ...styles,
      height: `${(100 / size) * blocks}%`,
      width: "100%",
    }}
  >
    {children}
  </NativeView>
);

export default View;
