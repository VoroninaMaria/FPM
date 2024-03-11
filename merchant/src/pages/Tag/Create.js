import * as React from "react";
import { Create, SimpleForm, TextInput, required } from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createTag = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        inputProps={{ maxLength: 255 }}
        source="name"
        validate={[required()]}
      />
    </SimpleForm>
  </Create>
);

export default createTag;
