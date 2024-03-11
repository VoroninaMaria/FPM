import {
  Datagrid,
  List,
  TextField,
  ShowButton,
  TextInput,
  Filter,
  Show,
  SimpleShowLayout,
  ImageField,
  useRecordContext,
  useResourceContext,
  NumberField,
  useTranslate,
  FunctionField,
  FileField,
} from "react-admin";
import {
  DateField,
  DeleteButton,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const ImageFilter = (props) => (
  <Filter {...props}>
    <TextInput source="name" alwaysOn />
  </Filter>
);
const ImagePanel = () => {
  const record = useRecordContext();
  const resource = useResourceContext();

  return (
    <Show title={`\xa0 ${record.name}`} resource={resource} id={record.id}>
      <SimpleShowLayout>
        {record.mimetype === "application/pdf" ? (
          <FileField
            label="resources.File.fields.link"
            source="url"
            title="name"
            target="_blank"
          />
        ) : (
          <ImageField source="url" />
        )}
      </SimpleShowLayout>
    </Show>
  );
};
const ListFile = (props) => {
  const t = useTranslate();

  return (
    <List
      filters={<ImageFilter {...props} />}
      actions={<CreateOnlyTopToolbar />}
    >
      <Datagrid bulkActionButtons={false} expand={<ImagePanel />} expandSingle>
        <TextField source="name" />
        <FunctionField
          source="mimetype"
          render={(record) =>
            t(`resources.File.source.mimetype.${record.mimetype}`)
          }
        />
        <NumberField source="size" />
        <DateField source="created_at" />
        <ShowButton className="button-show" />
        <DeleteButton className="button-delete" />
      </Datagrid>
    </List>
  );
};

export default ListFile;
