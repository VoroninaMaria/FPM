import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  required,
  TextInput,
  minLength,
  maxLength,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { GAS_BRAND_STATUSES } from "@local/app/constants/index.js";
import { CustomToolbar } from "../../shared/components/index.js";
export const BrandConnectors = ["Monobrand", "Datex"];

const createGasBrand = () => {
  const renderOptionText = (record) => (
    <span key={record.id}>
      <img
        src={record.url}
        alt={record.name}
        width={15}
        height={15}
        style={{ marginRight: "5px" }}
      />
      {record.name}
    </span>
  );

  return (
    <Create redirect="show">
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextInput
          source="name"
          type="text"
          validate={[required(), minLength(2), maxLength(30)]}
          inputProps={{ maxLength: 10 }}
        />
        <ReferenceInput source="logo_file_id" reference="File">
          <AutocompleteInput
            inputText={(record) => record.name}
            optionText={renderOptionText}
            optionValue="id"
            debounce={10}
            validate={[required()]}
            filterToQuery={(searchText) => ({ name: searchText })}
          />
        </ReferenceInput>
        <SelectInput
          source="status"
          validate={[required()]}
          choices={Object.keys(GAS_BRAND_STATUSES).map((status) => ({
            id: status,
            name: `resources.Brand.source.status.${status}`,
          }))}
        />
      </SimpleForm>
    </Create>
  );
};

export default createGasBrand;
