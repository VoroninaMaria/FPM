import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
  ReferenceField,
  ImageField,
} from "react-admin";

import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listGasBrand = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <ReferenceField source="logo_file_id" reference="File">
          <ImageField
            source="url"
            sx={{
              "& img": { maxWidth: 30, maxHeight: 30, objectFit: "contain" },
            }}
          />
        </ReferenceField>
        <TextField source="name" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.SmsService.source.status.${record.status}`)
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

export default listGasBrand;
