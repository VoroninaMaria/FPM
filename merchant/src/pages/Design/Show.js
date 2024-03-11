import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  useTranslate,
  FunctionField,
} from "react-admin";
import { ColorField } from "react-admin-color-picker";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showDesign = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <ColorField source="styles.color" />
        <ColorField source="styles.backgroundColor" />
        <FunctionField
          source="styles.justifyContent"
          render={(record) => t(`alignItems.${record.styles.justifyContent}`)}
        />
        <FunctionField
          source="styles.alignItems"
          render={(record) => t(`alignItems.${record.styles.alignItems}`)}
        />
        <ReferenceField source="default_page_id" reference="Page" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="error_page_id" reference="Page" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          source="authenticated_page_id"
          reference="Page"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="loader_page_id" reference="Page" link="show">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showDesign;
