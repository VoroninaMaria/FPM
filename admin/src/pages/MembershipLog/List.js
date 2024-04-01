import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  ShowButton,
  EditButton,
  FunctionField,
  useTranslate,
} from "react-admin";
import {
  DateField,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import * as React from "react";

const listMembershipLog = () => {
  const t = useTranslate();

  return (
    <List actions={<ShowOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <ReferenceField source="client_id" reference="Client" link="show">
          <TextField source="phone" />
        </ReferenceField>
        <ReferenceField
          source="membership_id"
          reference="Membership"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField source="start_date" />
        <DateField source="end_date" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Membership.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listMembershipLog;
