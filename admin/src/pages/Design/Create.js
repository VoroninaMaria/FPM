import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  SelectInput,
  ReferenceInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";
import { CustomToolbar } from "../../shared/components/index.js";

const createDesign = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ColorInput
        source="styles.backgroundColor"
        picker="Photoshop"
        validate={[required()]}
        defaultValue="#ffffff"
      />
      <ColorInput
        source="styles.color"
        picker="Photoshop"
        validate={[required()]}
        defaultValue="#000000"
      />
      <SelectInput
        source="styles.alignItems"
        defaultValue="center"
        choices={[
          { id: "center", name: "directions.center" },
          { id: "flex-start", name: "directions.top" },
          { id: "flex-end", name: "directions.bottom" },
        ]}
        validate={required()}
      />
      <SelectInput
        source="styles.justifyContent"
        defaultValue="center"
        choices={[
          { id: "center", name: "directions.center" },
          { id: "flex-start", name: "directions.left" },
          { id: "flex-end", name: "directions.right" },
        ]}
        translateChoice={true}
        validate={required()}
      />
    </SimpleForm>
  </Create>
);

export default createDesign;
