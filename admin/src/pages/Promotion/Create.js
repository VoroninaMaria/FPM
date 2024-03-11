import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  TextInput,
  DateTimeInput,
  required,
  AutocompleteInput,
} from "react-admin";
import { CustomToolbar } from "../../shared/components/index.js";

const createPromotion = () => {
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
        <ReferenceInput source="merchant_id" reference="Merchant">
          <SelectInput
            optionText="name"
            optionValue="id"
            validate={[required()]}
          />
        </ReferenceInput>
        <ReferenceInput source="file_id" reference="File">
          <AutocompleteInput
            inputText={(record) => record.name}
            optionText={renderOptionText}
            optionValue="id"
            debounce={10}
            validate={[required()]}
            filterToQuery={(searchText) => ({ name: searchText })}
          />
        </ReferenceInput>
        <TextInput
          source="title"
          inputProps={{ maxLength: 255 }}
          validate={[required()]}
        />
        <DateTimeInput
          source="start_date"
          validate={[required()]}
          defaultValue={new Date()}
        />
        <DateTimeInput
          source="end_date"
          validate={[required()]}
          defaultValue={new Date()}
        />
        <TextInput
          source="text"
          multiline
          fullWidth
          validate={[required()]}
          inputProps={{ maxLength: 255 }}
        />
      </SimpleForm>
    </Create>
  );
};

export default createPromotion;
