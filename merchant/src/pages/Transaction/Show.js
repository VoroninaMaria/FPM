import { SimpleShowLayout, Show, NumberField, TextField } from "react-admin";
import {
  Title,
  ShowOnlyNoEditTopToolbar,
  DateField,
} from "../../shared/components/index.js";

const TransactionShow = () => (
  <Show title={<Title source="name" />} actions={<ShowOnlyNoEditTopToolbar />}>
    <SimpleShowLayout>
      <NumberField source="id" />
      <TextField source="fn_card_owner" />
      <NumberField source="amount" />
      <NumberField source="sum" />
      <TextField source="n_accounts_struc" />
      <TextField source="n_service_station" />
      <TextField source="address" />
      <TextField source="n_issuers" />
      <NumberField source="confirm_status" />
      <DateField source="session_time" />
    </SimpleShowLayout>
  </Show>
);

export default TransactionShow;
