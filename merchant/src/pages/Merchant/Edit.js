import * as React from "react";
import { Edit, SimpleForm, TextField, PasswordInput } from "react-admin";

import { CustomToolbar, Title } from "../../shared/components/index.js";

const editMerchant = () => {
  return (
    <Edit
      redirect="show"
      title={<Title source="name" />}
      mutationMode="pessimistic"
    >
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextField source="name" />
        <PasswordInput
          inputProps={{ maxLength: 64 }}
          source="current_password"
        />

        <PasswordInput inputProps={{ maxLength: 64 }} source="new_password" />
      </SimpleForm>
    </Edit>
  );
};

export default editMerchant;
