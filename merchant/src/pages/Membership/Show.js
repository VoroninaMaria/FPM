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

        <ReferenceField source="location_id" reference="Location" link="show">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="start_date" />
        <DateField source="end_date" />
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
