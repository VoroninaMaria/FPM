import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  EditButton,
  NumberField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listSmsServices = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="service_name" />
        <JsonField
          label="resources.SmsService.fields.config.name"
          source="config"
          reactJsonOptions={{
            name: null,
            collapsed: true,
            enableClipboard: false,
            displayDataTypes: false,
          }}
          sortable={false}
        />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.SmsService.source.status.${record.status}`)
          }
        />
        <NumberField source="balance" />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listSmsServices;
