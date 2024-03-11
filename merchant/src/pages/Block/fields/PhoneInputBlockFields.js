import * as React from "react";
import {
  TextField,
  NumberField,
  Labeled,
  useTranslate,
  FunctionField,
} from "react-admin";
import { ColorField } from "react-admin-color-picker";

const PhoneInputBlockFields = () => {
  const t = useTranslate();

  return (
    <React.Fragment>
      <Labeled label="resources.Block.fields.styles.backgroundColor">
        <ColorField source="styles.backgroundColor" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.placeholderTextColor">
        <ColorField source="styles.placeholderTextColor" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.borderColor">
        <ColorField source="styles.borderColor" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.borderWidth">
        <NumberField source="styles.borderWidth" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.width">
        <TextField source="styles.width" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.height">
        <TextField source="styles.height" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.borderRadius">
        <NumberField source="styles.borderRadius" />
      </Labeled>
      <Labeled label="resources.Block.fields.container_styles.backgroundColor">
        <ColorField source="container_styles.backgroundColor" />
      </Labeled>
      <Labeled label="resources.Block.fields.container_styles.alignItems">
        <FunctionField
          source="container_styles.alignItems"
          render={(record) =>
            t(`alignItems.${record.container_styles.alignItems}`)
          }
        />
      </Labeled>
      <Labeled label="resources.Block.fields.container_styles.justifyContent">
        <FunctionField
          source="container_styles.justifyContent"
          render={(record) =>
            t(`justifyContent.${record.container_styles.justifyContent}`)
          }
        />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.color">
        <ColorField source="styles.color" />
      </Labeled>
    </React.Fragment>
  );
};

export default PhoneInputBlockFields;
