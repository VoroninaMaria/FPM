import * as React from "react";
import {
  Edit,
  TextField,
  SelectInput,
  TextInput,
  required,
  ReferenceInput,
  useEditContext,
  SimpleForm,
  minValue,
  maxValue,
  regex,
} from "react-admin";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const capacityRegex = regex(
  /^\d+$/,
  "resources.notifications.errors.invalid_syntax"
);
const ChooseDesign = () => {
  const { record } = useEditContext();

  return (
    <ReferenceInput
      source="design_id"
      reference="Design"
      filter={{
        merchant_id: record.id,
      }}
    >
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
  );
};

const editMerchant = () => (
  <Edit
    redirect="show"
    title={<Title source="name" />}
    mutationMode="pessimistic"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="name" />
      <ChooseDesign />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(MERCHANT_STATUSES).map((status) => ({
          id: status,
          name: `resources.Merchant.source.status.${status}`,
        }))}
      />
      <TextInput
        source="storage_capacity"
        type="number"
        min={0}
        max={1000}
        validate={[capacityRegex, required(), minValue(0), maxValue(1000)]}
      />
    </SimpleForm>
  </Edit>
);

export default editMerchant;
