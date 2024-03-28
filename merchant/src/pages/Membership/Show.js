import {
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  ArrayField,
  Datagrid,
  useTranslate,
  FunctionField,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showMembership = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <NumberField source="price" />
        <NumberField source="term" />
        <ReferenceField source="file_id" reference="File" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="location_id" reference="Location" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ArrayField source="abilities">
          <Datagrid optimized bulkActionButtons={null}>
            <TextField source="name" />
            <TextField source="regular_price" />
            <TextField source="discount_price" />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Membership.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showMembership;
