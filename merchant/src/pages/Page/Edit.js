import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  ReferenceInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-picker";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editPage = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
      <ReferenceInput source="design_id" reference="Design">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ColorInput
        source="styles.color"
        picker="Photoshop"
        validate={[required()]}
      />
      <ColorInput
        source="styles.backgroundColor"
        picker="Photoshop"
        validate={[required()]}
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
  </Edit>
);

export default editPage;
