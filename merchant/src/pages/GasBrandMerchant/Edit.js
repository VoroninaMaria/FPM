import * as React from "react";
import {
  Edit,
  SimpleForm,
  SelectInput,
  required,
  SimpleShowLayout,
  ReferenceField,
  TextField,
  ArrayInput,
  SimpleFormIterator,
  TextInput,
  maxValue,
  minValue,
  NumberInput,
} from "react-admin";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editGasBrandMerchant = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <SimpleShowLayout>
        <ReferenceField source="gas_brand_id" reference="GasBrand" link="show">
          <TextField source="name" />
        </ReferenceField>
      </SimpleShowLayout>
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(GAS_BRAND_MERCHANT_STATUSES).map((status) => ({
          id: status,
          name: `resources.GasBrandMerchant.source.status.${status}`,
        }))}
      />
      <ArrayInput source="fuels">
        <SimpleFormIterator inline disableClear>
          <TextInput
            source="name"
            label="resources.GasBrandMerchant.fuels.name"
            validate={[required()]}
            inputProps={{ maxLength: 55, minLength: 1 }}
          />
          <NumberInput
            source="regular_price"
            label="resources.GasBrandMerchant.fuels.regular_price"
            validate={[required(), maxValue(2147483647), minValue(0)]}
          />
          <NumberInput
            source="discount_price"
            label="resources.GasBrandMerchant.fuels.discount_price"
            validate={[required(), maxValue(2147483647), minValue(0)]}
          />
          <SelectInput
            source="status"
            label="resources.GasBrandMerchant.fuels.status"
            validate={[required()]}
            choices={Object.keys(GAS_BRAND_MERCHANT_STATUSES).map((status) => ({
              id: status,
              name: `resources.GasBrandMerchant.source.status.${status}`,
            }))}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default editGasBrandMerchant;
