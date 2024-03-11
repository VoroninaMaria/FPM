import {
  List,
  Datagrid,
  TextField,
  useTranslate,
  FunctionField,
  ShowButton,
  EditButton,
  ReferenceField,
} from "react-admin";

import {
  DateField,
  CreateOnlyTopToolbar,
} from "../../shared/components/index.js";

const listGasBrandMerchant = () => {
  const t = useTranslate();

  return (
    <List actions={<CreateOnlyTopToolbar />}>
      <Datagrid bulkActionButtons={false}>
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="gas_brand_id" reference="GasBrand" link="show">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.GasBrandMerchant.source.status.${record.status}`)
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

export default listGasBrandMerchant;
