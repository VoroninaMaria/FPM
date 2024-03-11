import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextField,
  SelectInput,
  required,
  SimpleShowLayout,
  ReferenceField,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";
import { BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editBrandMerchant = () => (
  <Edit
    redirect="show"
    title={<Title source="id" />}
    mutationMode="pessimistic"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <SimpleShowLayout>
        <ReferenceField source="brand_id" reference="Brand" link="show">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="id" />
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
