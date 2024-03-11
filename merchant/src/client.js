import {
  List,
  Datagrid,
  DateField,
  TextField,
  TextInput,
  Filter,
} from "react-admin";
import React from "react";

export const ClientFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search by phone" source="phone" alwaysOn />
  </Filter>
);

export const ClientList = (props) => (
  <List filters={<ClientFilter />} {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="phone" />
      <TextField source="status" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
    </Datagrid>
  </List>
);
