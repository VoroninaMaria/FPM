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
  useNotify,
  useGetOne,
} from "react-admin";
import { JsonField } from "react-admin-json-view";

import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";
import { CLIENT_STATUSES } from "@local/constants/index.js";

const ClientFilter = (props) => {
  const notify = useNotify();
  const { data: merchant, error } = useGetOne("Merchant", {
    id: localStorage.getItem("id"),
  });

  if (error) {
    return notify(`resources.notifications.errors.${error.message}`, {
      type: "error",
    });
  }
  return (
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
      {!error && merchant?.plugins.datex === false && (
        <ReferenceInput alwaysOn source="category_id" reference="Category">
          <SelectInput optionText="name" optionValue="id" />
        </ReferenceInput>
      )}
    </Filter>
  );
};
const ListClients = (props) => {
  const t = useTranslate();
  const notify = useNotify();
  const { data: merchant, error } = useGetOne("Merchant", {
    id: localStorage.getItem("id"),
  });

  if (error) {
    return notify(`resources.notifications.errors.${error.message}`, {
      type: "error",
    });
  }

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
        <FunctionField
          source="entity"
          sortable={false}
          render={(record) => {
            if (record.entity === 1) {
              return t("resources.Client.source.entity.physical");
            }

            if (record.entity === 2) {
              return t("resources.Client.source.entity.legal");
            }
          }}
        />
        {!error && merchant?.plugins.datex === false && (
          <ReferenceField source="category_id" reference="Category" link="show">
            <TextField source="name" />
          </ReferenceField>
        )}
        {!error && merchant?.plugins.datex === false && (
          <ReferenceArrayField
            source="tag_ids"
            reference="Tag"
            sortable={false}
          >
            <SingleFieldList linkType="show">
              <ChipField source="name" size="small" />
            </SingleFieldList>
          </ReferenceArrayField>
        )}
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
