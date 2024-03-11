import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  useTranslate,
  FunctionField,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showBrandMerchant = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="id" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <ReferenceField source="brand_id" reference="Brand" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="merchant_id" reference="Merchant" link="show">
          <TextField source="name" />
        </ReferenceField>
        <JsonField
          source="config"
          reactJsonOptions={{
            name: null,
            collapsed: true,
            enableClipboard: false,
            displayDataTypes: false,
          }}
        />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.BrandMerchant.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showBrandMerchant;
