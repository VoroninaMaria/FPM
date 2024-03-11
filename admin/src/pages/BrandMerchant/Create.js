import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";
import { BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";

const createBrandMerchant = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <ReferenceInput source="merchant_id" reference="Merchant">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <ReferenceInput source="brand_id" reference="Brand">
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <JsonInput
        validate={[required()]}
        source="config"
        reactJsonOptions={{
          name: null,
          collapsed: false,
          enableClipboard: false,
          displayDataTypes: false,
        }}
      />
      <SelectInput
        source="status"
        validate={[required()]}
        choices={Object.keys(BRAND_MERCHANT_STATUSES).map((status) => ({
          id: status,
          name: `resources.BrandMerchant.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createBrandMerchant;
