import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
  ArrayField,
  Datagrid,
  ReferenceField,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showBrand = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
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
        <ArrayField source="fuels">
          <Datagrid optimized bulkActionButtons={null}>
            <TextField
              source="name"
              label="resources.GasBrandMerchant.fuels.name"
            />
            <TextField
              source="regular_price"
              label="resources.GasBrandMerchant.fuels.regular_price"
            />
            <TextField
              source="discount_price"
              label="resources.GasBrandMerchant.fuels.discount_price"
            />
            <FunctionField
              source="status"
              render={(record) =>
                t(`resources.GasBrandMerchant.source.status.${record.status}`)
              }
            />
          </Datagrid>
        </ArrayField>
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showBrand;
