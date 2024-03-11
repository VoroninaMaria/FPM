import { createElement } from "react";
import Elements from "../Elements";
import { View as NativeView } from "react-native";
import buildStyles from "./Layout.styles.js";

const buildComponent = (collection, type, { ...props }) => {
  return createElement(collection[type], props);
};

const Layout = ({
  styles = {},
  children = [],
  callbacks,
  storage,
  actions,
}) => {
  const buildParentStyles = { ...styles };
  const builtStyles = buildStyles(buildParentStyles);

  const blocksOnPage = children.reduce(
    (partialSum, a) => partialSum + (a.blocks || 1),
    0
  );

  const preparedChildren = children.map(
    ({ type, props = {}, container_styles = {}, blocks = 1, id, styles }) => {
      return (
        <Elements.View
          key={id}
          styles={{ ...container_styles }}
          blocks={blocks}
          size={blocksOnPage}
        >
          {buildComponent(Elements, type, {
            ...props,
            callbacks,
            styles,
            id,
            storage,
            actions,
          })}
        </Elements.View>
      );
    }
  );

  return <NativeView style={builtStyles.Layout}>{preparedChildren}</NativeView>;
};

export default Layout;
