import {
  Datagrid,
  List,
  TextField,
  ShowButton,
  EditButton,
  ReferenceField,
  FunctionField,
  useTranslate,
  Filter,
  ReferenceInput,
  SelectInput,
} from "react-admin";
import {
  DateField,
  CreateOnlyTopToolbar,
  DeleteButton,
} from "../../shared/components/index.js";

const BlockFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput alwaysOn source="page_id" reference="Page" link="show">
      <SelectInput optionText="name" optionValue="id" resettable={true} />
    </ReferenceInput>
  </Filter>
);

const listBlock = (props) => {
  const t = useTranslate();

  return (
    <List
      actions={<CreateOnlyTopToolbar />}
      filters={<BlockFilter {...props} />}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="name" />
        <ReferenceField source="page_id" reference="Page" link="show">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="position" />
        <FunctionField
          source="type"
          render={(record) => t(`resources.Block.source.type.${record.type}`)}
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
        <DeleteButton className="button-delete" />
      </Datagrid>
    </List>
  );
};

export default listBlock;
