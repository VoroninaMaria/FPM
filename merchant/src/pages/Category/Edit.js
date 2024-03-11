import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  TextInput,
  ReferenceInput,
  required,
} from "react-admin";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editCategory = () => (
  <Edit
    redirect="show"
    title={<Title source="name" />}
    mutationMode="pessimistic"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="name" />
      <ReferenceInput source="id" reference="Category">
        <TextInput
          inputProps={{ maxLength: 255 }}
          source="name"
          validate={[required()]}
        />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export default editCategory;
