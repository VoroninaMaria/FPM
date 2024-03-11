import * as React from "react";
import {
  Create,
  SimpleForm,
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
      <SimpleForm toolbar={<CustomToolbar />} mode="all">
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
        <DateTimeInput
          source="start_date"
          defaultValue={new Date()}
          validate={[required()]}
        />
        <DateTimeInput
          source="end_date"
          defaultValue={new Date()}
          validate={[required()]}
        />
        <TextInput
          source="title"
          validate={[required()]}
          inputProps={{ maxLength: 255 }}
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
