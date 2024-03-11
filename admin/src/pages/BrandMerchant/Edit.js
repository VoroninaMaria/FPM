import * as React from "react";
import {
  Edit,
  SimpleForm,
  SelectInput,
  ReferenceField,
  TextField,
  required,
  SimpleShowLayout,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";

import { BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editBrandMerchant = () => (
  <Edit
    title={<Title source="id" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <SimpleShowLayout>
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" helpers="Merchant" />
        </ReferenceField>
        <ReferenceField source="brand_id" reference="Brand" link="show">
          <TextField source="name" />
        </ReferenceField>
      </SimpleShowLayout>
      <JsonInput
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
  </Edit>
);

export default editBrandMerchant;
