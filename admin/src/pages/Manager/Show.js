import { Show, SimpleShowLayout, TextField, ReferenceField } from "react-admin";
import {
  DateField,
  ShowOnlyNoEditTopToolbar,
  Title,
} from "../../shared/components/index.js";

const showManagers = () => (
  <Show title={<Title source="id" />} actions={<ShowOnlyNoEditTopToolbar />}>
    <SimpleShowLayout bulkActionButtons={false}>
      <ReferenceField source="company_id" reference="Company" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="client_id" reference="Client" link="show">
        <TextField source="phone" />
      </ReferenceField>
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showManagers;
