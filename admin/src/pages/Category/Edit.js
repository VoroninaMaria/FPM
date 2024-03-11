import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  TextInput,
  ReferenceInput,
  required,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editCategory = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
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
