import * as React from "react";
import {
  Create,
  SimpleForm,
  required,
  SelectInput,
  TextInput,
  PasswordInput,
  minLength,
  maxLength,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";
import { MERCHANT_STATUSES } from "@local/app/constants/index.js";

const createMerchant = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        source="name"
        type="text"
        validate={[required(), minLength(4), maxLength(10)]}
        inputProps={{ maxLength: 10 }}
      />
      <TextInput
        source="login"
        type="text"
        validate={[required(), minLength(4), maxLength(10)]}
        inputProps={{ maxLength: 10 }}
      />
      <PasswordInput
        source="password"
        validate={[required()]}
        inputProps={{ maxLength: 64 }}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(MERCHANT_STATUSES).map((status) => ({
          id: status,
          name: `resources.Merchant.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createMerchant;
