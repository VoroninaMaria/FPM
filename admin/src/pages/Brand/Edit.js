import * as React from "react";
import {
  Edit,
  SimpleForm,
  SelectInput,
  required,
  TextField,
} from "react-admin";
import { JsonInput } from "react-admin-json-view";
import { BRAND_STATUSES } from "@local/app/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const editBrand = () => (
  <Edit
    title={<Title source="name" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <SimpleForm toolbar={<CustomToolbar />}>
      <TextField source="name" />
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
  </Edit>
);

export default editBrand;
