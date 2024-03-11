import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
} from "react-admin";

import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listBrand = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="name" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.PaymentGateway.source.status.${record.status}`)
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

export default listBrand;
