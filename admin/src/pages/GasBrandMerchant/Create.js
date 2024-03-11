import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  required,
  ReferenceInput,
} from "react-admin";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";

const createGasBrandMerchant = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ReferenceInput source="gas_brand_id" reference="GasBrand">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(GAS_BRAND_MERCHANT_STATUSES).map((status) => ({
          id: status,
          name: `resources.GasBrandMerchant.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createGasBrandMerchant;
