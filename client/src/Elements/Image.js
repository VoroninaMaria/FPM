import { Image as NativeImage, Pressable } from "react-native";

import buildStyles from "./Image.styles";

const Image = ({ styles, fileType, uri, redirect_page_id, storage }) => {
  const builtStyles = buildStyles(styles);

  if (fileType === "application/pdf") {
    return (
      <a href={uri} download target="_blank" rel="noopener noreferrer">
        Click here
      </a>
    );
  }

  if (redirect_page_id)
    return (
      <Pressable
        onPress={() => {
          storage.callbacks.redirect({ page: redirect_page_id });
        }}
        style={builtStyles.Image}
      >
        <NativeImage source={{ uri }} style={builtStyles.Image} />
      </Pressable>
    );

  return <NativeImage source={{ uri }} style={builtStyles.Image} />;
};

export default Image;
