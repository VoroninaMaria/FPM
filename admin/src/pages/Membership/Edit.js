import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  required,
  SelectInput,
  NumberInput,
  DateTimeInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editLocation = () => {
  const [selectedMerchant, setSelectedMerchant] = React.useState("");

  const handleOptionChange = (event) => {
    event.preventDefault();
    setSelectedMerchant(event.target.value);
  };

  return (
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
        <ArrayInput source="abilities">
          <SimpleFormIterator inline disableClear>
            <TextInput
              source="name"
              inputProps={{ maxLength: 55, minLength: 1 }}
              validate={[required()]}
            />
            <TextInput
              source="description"
              inputProps={{ maxLength: 55, minLength: 1 }}
              validate={[required()]}
            />
            <NumberInput source="regular_price" validate={[required()]} />
            <NumberInput source="discount_price" validate={[required()]} />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
};

export default editLocation;
