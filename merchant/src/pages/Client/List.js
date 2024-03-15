import React from "react";
import {
  List,
  Datagrid,
  TextField,
  ShowButton,
  EditButton,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  TextInput,
  SelectInput,
  ReferenceInput,
  Filter,
  useTranslate,
  FunctionField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";

import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";
import { CLIENT_STATUSES } from "@local/constants/index.js";

const ClientFilter = (props) => (
  <Filter {...props}>
    <TextInput source="phone" alwaysOn />
    <SelectInput
      alwaysOn
      source="status"
      choices={Object.keys(CLIENT_STATUSES).map((status) => ({
        id: status,
        name: `resources.Client.source.status.${status}`,
      }))}
    />
    <ReferenceInput alwaysOn source="category_id" reference="Category">
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
  </Filter>
);

const ListClients = (props) => {
  const t = useTranslate();

  return (
    <List
      filters={<ClientFilter {...props} />}
      actions={<CreateOnlyTopToolbar />}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="phone" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <TextField source="email" />
        <ReferenceField source="category_id" reference="Category" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="discount_id" reference="Discount" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceArrayField source="tag_ids" reference="Tag" sortable={false}>
          <SingleFieldList>
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Client.source.status.${record.status}`)
          }
        />
        <JsonField
          reference="Changes"
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
          reactJsonOptions={{
            name: null,
            collapsed: true,
            enableClipboard: false,
            displayDataTypes: false,
          }}
          sortable={false}
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default ListClients;
