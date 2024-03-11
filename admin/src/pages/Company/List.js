import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  ShowButton,
  BooleanField,
  TopToolbar,
} from "react-admin";
import { DateField } from "../../shared/components/index.js";

const listCompanies = () => (
  <List actions={<TopToolbar />}>
    <Datagrid bulkActionButtons={false}>
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
      <BooleanField source="active" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ShowButton className="button-show" />
    </Datagrid>
  </List>
);

export default listCompanies;
