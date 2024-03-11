import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  useUnique,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createCategory = () => {
  const unique = useUnique();

  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextInput
          inputProps={{ maxLength: 255 }}
          source="name"
          validate={[
            required(),
            unique({
              debounce: 100,
              message: "resources.notifications.errors.already_exist",
            }),
          ]}
        />
      </SimpleForm>
    </Create>
  );
};

export default createCategory;
