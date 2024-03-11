import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
  NumberField,
  TopToolbar,
  ReferenceField,
} from "react-admin";
import { DateField } from "../../shared/components/index.js";
import React from "react";

const listMerchants = () => {
  const t = useTranslate();

  const [designEditorEnabled, setDesignEditorEnabled] = React.useState(false);

  React.useEffect(() => {
    const plugins = JSON.parse(localStorage.getItem("plugins"));

    setDesignEditorEnabled(plugins.designEditor);
  });

  return (
    <List actions={<TopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="login" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Merchant.source.status.${record.status}`)
          }
        />
        <NumberField source="storage_capacity" />
        {designEditorEnabled && (
          <ReferenceField source="design_id" reference="Design" link="show">
            <TextField source="name" />
          </ReferenceField>
        )}
        <TextField source="newbie" />
        <DateField source="created_at" />
        <DateField source="updated_at" />
        <ShowButton className="button-show" />
        <EditButton className="button-edit" />
      </Datagrid>
    </List>
  );
};

export default listMerchants;
