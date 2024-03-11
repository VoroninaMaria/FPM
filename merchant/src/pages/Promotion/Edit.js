import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  DateTimeInput,
  required,
} from "react-admin";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const editPromotion = () => {
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
    <Edit
      title={<Title source="title" />}
      redirect="show"
      mutationMode="pessimistic"
    >
      <SimpleForm toolbar={<CustomToolbar />}>
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
          defaultValue={new Date()}
          validate={[required()]}
        />
        <DateTimeInput
          source="end_date"
          defaultValue={new Date()}
          validate={[required()]}
        />
        <TextInput source="text" multiline fullWidth validate={[required()]} />
      </SimpleForm>
    </Edit>
  );
};

export default editPromotion;
