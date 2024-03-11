import * as React from "react";
import { Create, SimpleForm, SelectInput, required } from "react-admin";
import { JsonInput } from "react-admin-json-view";
import { BRAND_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";
export const BrandConnectors = ["Monobrand", "Datex"];

const createBrand = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<CustomToolbar />}>
      <SelectInput
        source="name"
        choices={BrandConnectors.map((key) => ({
          id: key,
          name: key,
        }))}
        validate={[required()]}
      />
      <JsonInput
        source="default_config"
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
        choices={Object.keys(BRAND_STATUSES).map((status) => ({
          id: status,
          name: `resources.Brand.source.status.${status}`,
        }))}
      />
    </SimpleForm>
  </Create>
);

export default createBrand;
