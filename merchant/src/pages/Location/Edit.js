import * as React from "react";
import { Edit, SimpleForm, TextInput, required } from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editLocation = () => (
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
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="address"
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
);

export default editLocation;
