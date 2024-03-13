import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
  NumberField,
  ReferenceField,
} from "react-admin";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listMerchants = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="login" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Merchant.source.status.${record.status}`)
          }
        />
        <ReferenceField source="design_id" reference="Design" link="show">
          <TextField source="name" />
        </ReferenceField>
        <NumberField source="storage_capacity" />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listMerchants;
