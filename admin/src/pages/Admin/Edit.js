import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  PasswordInput,
  required,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editAdmin = () => (
  <Edit
    title={<Title source="login" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="login" />
      <PasswordInput
        inputProps={{ maxLength: 64 }}
        source="current_password"
        validate={[required()]}
      />
      <PasswordInput
        inputProps={{ maxLength: 64 }}
        source="new_password"
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
);

export default editAdmin;
