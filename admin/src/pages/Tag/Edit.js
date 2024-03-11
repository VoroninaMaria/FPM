import * as React from "react";
import { Edit, SimpleForm, TextInput, required } from "react-admin";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editTag = () => (
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
    </SimpleForm>
  </Edit>
);

export default editTag;
