import {
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
  NumberField,
  ReferenceField,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showMerchant = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
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
      </SimpleShowLayout>
    </Show>
  );
};

export default showMerchant;
