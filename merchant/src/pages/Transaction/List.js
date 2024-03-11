import {
  Datagrid,
  List,
  NumberField,
  TextField,
  TopToolbar,
  ShowButton,
  Filter,
  NumberInput,
  TextInput,
} from "react-admin";
import { DateField } from "../../shared/components/index.js";

const DatexTransactionFilter = (props) => (
  <Filter {...props}>
    <TextInput source="fn_card_owner" alwaysOn />
    <TextInput source="n_accounts_struc" alwaysOn />
    <NumberInput source="amount" alwaysOn />
  </Filter>
);

const DatexTransactionList = (props) => (
  <List
    filters={<DatexTransactionFilter {...props} />}
    actions={<TopToolbar />}
  >
    <Datagrid bulkActionButtons={false}>
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
      <ShowButton className="button-show" />
    </Datagrid>
  </List>
);

export default DatexTransactionList;
