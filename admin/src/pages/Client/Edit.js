import * as React from "react";
import {
  Edit,
  TabbedForm,
  TextInput,
  SelectInput,
  ArrayInput,
  SelectArrayInput,
  SimpleFormIterator,
  ReferenceInput,
  ReferenceArrayInput,
  useEditContext,
  required,
  number,
  email,
} from "react-admin";
import {
  CLIENT_STATUSES,
  CLIENT_CHANGE_STATUSES,
} from "@local/constants/index.js";
import { CustomToolbar, Title } from "../../shared/components/index.js";

const ClientCategory = () => {
  const { record } = useEditContext();

  return (
    <ReferenceInput
      source="category_id"
      reference="Category"
      filter={{
        merchant_id: record.merchant_id,
      }}
    >
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
  );
};

const ClientMembership = () => {
  const { record } = useEditContext();

  return (
    <ReferenceInput
      source="membership_id"
      reference="Membership"
      filter={{
        merchant_id: record.merchant_id,
      }}
    >
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
  );
};

const ClientTags = () => {
  const { record } = useEditContext();

  return (
    <ReferenceArrayInput
      source="tag_ids"
      reference="Tag"
      filter={{
        merchant_id: record.merchant_id,
      }}
    >
      <SelectArrayInput optionText="name" optionValue="id" />
    </ReferenceArrayInput>
  );
};

const editClient = () => (
  <Edit
    title={<Title source="phone" />}
    mutationMode="pessimistic"
    redirect="show"
  >
    <TabbedForm toolbar={<CustomToolbar />}>
      <TabbedForm.Tab label="resources.Client.source.tab.basic">
        <TextInput
          helperText="youremail@example.com"
          inputProps={{ maxLength: 255 }}
          source="email"
          validate={[email()]}
        />
        <TextInput inputProps={{ maxLength: 64 }} source="first_name" />
        <TextInput inputProps={{ maxLength: 64 }} source="last_name" />
        <TextInput
          helperText="380000000000"
          inputProps={{ maxLength: 12 }}
          source="phone"
          validate={[required(), number()]}
        />
        <ClientCategory />
        <ClientMembership />
        <ClientTags />
        <SelectInput
          source="status"
          validate={[required()]}
          choices={Object.keys(CLIENT_STATUSES).map((status) => ({
            id: status,
            name: `resources.Client.source.status.${status}`,
          }))}
        />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="resources.Client.source.tab.confirm_changes">
        <ArrayInput
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
        >
          <SimpleFormIterator
            disableAdd
            disableRemove
            disableClear
            disableReordering
            inline
          >
            <TextInput source="field_name" disabled />
            <TextInput source="value" disabled />
            <SelectInput
              source="status"
              validate={[required()]}
              choices={Object.keys(CLIENT_CHANGE_STATUSES).map((status) => ({
                id: status,
                name: `resources.Client.source.changes_status.${status}`,
              }))}
            />
          </SimpleFormIterator>
        </ArrayInput>
      </TabbedForm.Tab>
    </TabbedForm>
  </Edit>
);

export default editClient;
