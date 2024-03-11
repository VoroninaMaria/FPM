import { Show, SimpleShowLayout, TextField, ReferenceField } from "react-admin";
import {
  DateField,
  ShowOnlyNoEditTopToolbar,
  Title,
} from "../../shared/components/index.js";

const showCompanies = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyNoEditTopToolbar />}>
    <SimpleShowLayout bulkActionButtons={false}>
      <TextField source="name" />
      <ReferenceField source="merchant_id" reference="Merchant" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField
        source="brand_merchant_id"
        reference="BrandMerchant"
        link="show"
      >
        <TextField source="id" />
      </ReferenceField>
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

export default showCompanies;
