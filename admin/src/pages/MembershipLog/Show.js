import {
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  FunctionField,
  useTranslate,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";
import * as React from "react";

const showMembershipLog = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
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
      </SimpleShowLayout>
    </Show>
  );
};

export default showMembershipLog;
