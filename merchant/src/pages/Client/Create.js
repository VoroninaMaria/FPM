import * as React from "react";
import {
  Create,
  SimpleForm,
  required,
  SelectInput,
  TextInput,
  PasswordInput,
  ReferenceInput,
  ReferenceArrayInput,
  SelectArrayInput,
  email,
  number,
  useNotify,
  useGetOne,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const CategoryAndTags = () => {
  const notify = useNotify();
  const { data: merchant, error } = useGetOne("Merchant", {
    id: localStorage.getItem("id"),
  });

  if (error) {
    return notify(`resources.notifications.errors.${error.message}`, {
      type: "error",
    });
  }
  if (!error && merchant?.plugins.datex === false) {
    return (
      <>
        <ReferenceInput
          source="category_id"
          reference="Category"
          filter={{
            merchant_id: merchant.id,
          }}
        >
          <SelectInput
            sx={{ width: "14%" }}
            optionText="name"
            optionValue="id"
          />
        </ReferenceInput>
        <ReferenceArrayInput
          source="tag_ids"
          reference="Tag"
          filter={{
            merchant_id: merchant.id,
          }}
        >
          <SelectArrayInput
            sx={{ width: "14%" }}
            optionText="name"
            optionValue="id"
          />
        </ReferenceArrayInput>
      </>
    );
  }
  return;
};

const createClient = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextInput
        helperText="380000000000"
        inputProps={{ maxLength: 12 }}
        source="phone"
        validate={[required(), number()]}
      />
      <TextInput
        helperText="youremail@gmail.com"
        inputProps={{ maxLength: 64 }}
        source="email"
        validate={[email()]}
      />
      <TextInput
        inputProps={{ maxLength: 64 }}
        source="first_name"
        validate={[required()]}
      />
      <TextInput
        inputProps={{ maxLength: 64 }}
        source="last_name"
        validate={[required()]}
      />
      <SelectInput
        sx={{ width: "14%" }}
        source="entity"
        choices={[{ name: "resources.Client.source.entity.physical", id: 1 }]}
        validate={[required()]}
      />
      <PasswordInput
        sx={{ width: "14%" }}
        source="password"
        validate={[required()]}
        inputProps={{ maxLength: 10 }}
      />
      <CategoryAndTags />
    </SimpleForm>
  </Create>
);

export default createClient;
