import { ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showCategory = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
    <SimpleShowLayout>
      <TextField source="name" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showCategory;
