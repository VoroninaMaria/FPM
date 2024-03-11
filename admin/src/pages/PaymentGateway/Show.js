import * as React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
} from "react-admin";

import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
} from "../../shared/components/index.js";

const showPaymentGateway = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="name" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.PaymentGateway.source.status.${record.status}`)
          }
        />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleShowLayout>
    </Show>
  );
};

export default showPaymentGateway;
