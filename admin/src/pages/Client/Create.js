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
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createClient = () => {
  const [selectedMerchant, setSelectedMerchant] = React.useState("");

  const handleOptionChange = (event) => {
    event.preventDefault();
    setSelectedMerchant(event.target.value);
  };

  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <ReferenceInput source="merchant_id" reference="Merchant">
          <SelectInput
            optionText="name"
            value={selectedMerchant}
            onChange={handleOptionChange}
            validate={[required()]}
          />
        </ReferenceInput>
        {selectedMerchant && (
          <>
            <ReferenceInput
              source="category_id"
              reference="Category"
              filter={{ merchant_id: selectedMerchant }}
            >
              <SelectInput optionText="name" optionValue="id" />
            </ReferenceInput>
            <ReferenceArrayInput
              source="tag_ids"
              reference="Tag"
              filter={{ merchant_id: selectedMerchant }}
            >
              <SelectArrayInput optionText="name" optionValue="id" />
            </ReferenceArrayInput>
            <ReferenceInput
              source="discount_id"
              reference="Discount"
              filter={{ merchant_id: selectedMerchant }}
            >
              <SelectInput optionText="name" optionValue="id" />
            </ReferenceInput>
          </>
        )}
        <TextInput
          helperText="youremail@gmail.com"
          inputProps={{ maxLength: 64 }}
          source="email"
          validate={[email()]}
        />
        <TextInput inputProps={{ maxLength: 64 }} source="first_name" />
        <TextInput inputProps={{ maxLength: 64 }} source="last_name" />
        <TextInput
          helperText="380000000000"
          inputProps={{ maxLength: 12 }}
          source="phone"
          validate={[required(), number()]}
        />
        <PasswordInput
          source="password"
          validate={[required()]}
          inputProps={{ maxLength: 10 }}
        />
      </SimpleForm>
    </Create>
  );
};

export default createClient;
