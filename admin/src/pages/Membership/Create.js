import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  TextInput,
  ReferenceInput,
  required,
  NumberInput,
  DateTimeInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createMembership = () => {
  const [selectedMerchant, setSelectedMerchant] = React.useState("");

  const handleOptionChange = (event) => {
    event.preventDefault();
    setSelectedMerchant(event.target.value);
  };

  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextInput
          inputProps={{ maxLength: 255 }}
          source="name"
          validate={[required()]}
        />
        <NumberInput source="price" validate={[required()]} />
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
              source="location_id"
              reference="Location"
              filter={{ merchant_id: selectedMerchant }}
            >
              <SelectInput optionText="name" optionValue="id" />
            </ReferenceInput>
          </>
        )}
        <DateTimeInput source="start_date" validate={[required()]} />
        <DateTimeInput source="end_date" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};

export default createMembership;
