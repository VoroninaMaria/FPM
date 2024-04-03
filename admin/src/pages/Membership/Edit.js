import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  required,
  SelectInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Title, CustomToolbar } from "../../shared/components/index.js";
import { MEMBERSHIP_STATUSES } from "@local/constants/index.js";

const validatePrice = (value) => {
  if (value < 0 || value > 100000) {
    return "0 - 100000";
  }
};

const validateTerm = (value) => {
  if (value < 0 || value > 365) {
    return "0 - 365";
  }
};

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
        <NumberInput source="price" validate={[required(), validatePrice]} />
        <NumberInput source="term" validate={[required(), validateTerm]} />
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
              <SelectInput
                optionText="name"
                optionValue="id"
                validate={[required()]}
              />
            </ReferenceInput>
          </>
        )}
        {selectedMerchant && (
          <>
            <ReferenceInput
              source="file_id"
              reference="File"
              filter={{ account_id: selectedMerchant }}
            >
              <SelectInput
                optionText="name"
                optionValue="id"
                validate={[required()]}
              />
            </ReferenceInput>
          </>
        )}
        <SelectInput
          source="status"
          validate={[required()]}
          choices={Object.keys(MEMBERSHIP_STATUSES).map((status) => ({
            id: status,
            name: `resources.Membership.source.status.${status}`,
          }))}
        />
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
