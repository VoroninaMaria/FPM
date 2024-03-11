import * as React from "react";
import {
  Create,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  required,
  TextInput,
  useRedirect,
  useNotify,
  useRefresh,
  Toolbar,
  SaveButton,
  minValue,
  maxValue,
  AutocompleteInput,
} from "react-admin";
import { intRegex } from "../../shared/components/index.js";

const SaveTruncToolbar = (props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const onError = ({ message }) => {
    return (
      notify(`resources.notifications.errors.${message}`, {
        type: "error",
      }),
      refresh()
    );
  };

  const onSuccess = (data) => {
    redirect("show", "Trunc", data.id);
    return window.open(data.transactions[0]?.trunc?.url, "_blank").focus();
  };

  return (
    <Toolbar
      {...props}
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <SaveButton type="button" mutationOptions={{ onSuccess, onError }} />
    </Toolbar>
  );
};

const createTrunc = () => (
  <Create redirect="show">
    <SimpleForm toolbar={<SaveTruncToolbar />}>
      <ReferenceInput source="client_id" reference="Client">
        <AutocompleteInput
          inputText={(record) => record.phone}
          optionText="phone"
          optionValue="id"
          debounce={10}
          validate={[required()]}
          filterToQuery={(searchText) => ({ phone: searchText })}
        />
      </ReferenceInput>
      <ReferenceInput
        source="merchant_payment_gateway_id"
        reference="MerchantPaymentGateway"
      >
        <SelectInput
          optionText="name"
          optionValue="id"
          validate={[required()]}
        />
      </ReferenceInput>
      <TextInput
        type="number"
        source="amount"
        validate={[intRegex, required(), minValue(1), maxValue(10000)]}
      />
      <TextInput
        source="description"
        inputProps={{ maxLength: 64 }}
        validate={[required()]}
      />
    </SimpleForm>
  </Create>
);

export default createTrunc;
