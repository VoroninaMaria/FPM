import * as React from "react";
import { TextField, NumberField, Labeled, ReferenceField } from "react-admin";
import { ColorField } from "react-admin-color-picker";

const ButtonBlockFields = () => {
  return (
    <React.Fragment>
      <Labeled label="resources.Block.fields.props.text">
        <TextField source="props.text" />
      </Labeled>
      <Labeled label="resources.Block.fields.props.action">
        <TextField source="props.action" />
      </Labeled>
      <Labeled label="resources.Block.fields.props.redirect_page_id">
        <ReferenceField
          source="props.redirect_page_id"
          reference="Page"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
      </Labeled>
      <Labeled label="resources.Block.fields.styles.backgroundColor">
        <ColorField source="styles.backgroundColor" />
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
      <Labeled label="resources.Block.fields.styles.fontWeight">
        <NumberField source="styles.fontWeight" />
      </Labeled>
      <Labeled label="resources.Block.fields.styles.fontSize">
        <NumberField source="styles.fontSize" />
      </Labeled>
    </React.Fragment>
  );
};

export default ButtonBlockFields;
