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

const createPage = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={required()}
      />
      <ReferenceInput source="design_id" reference="Design">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ColorInput
        source="styles.backgroundColor"
        picker="Photoshop"
        defaultValue="#ffffff"
        validate={required()}
      />
      <ColorInput
        source="styles.color"
        picker="Photoshop"
        defaultValue="#000000"
        validate={required()}
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

export default createPage;
