import * as React from "react";
import {
  Edit,
  TabbedForm,
  TextField,
  SelectInput,
  TextInput,
  required,
  ReferenceInput,
  useEditContext,
  BooleanInput,
  minValue,
  maxValue,
  regex,
  useRecordContext,
} from "react-admin";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { Title, CustomToolbar } from "../../shared/components/index.js";

const capacityRegex = regex(
  /^\d+$/,
  "resources.notifications.errors.invalid_syntax"
);

const ShowPlugins = () => {
  const record = useRecordContext();

  if (record && record.plugins.datex === true) {
    return <BooleanInput source="plugins.datex" />;
  }

  return (
    <>
      <BooleanInput source="plugins.datex" />
      <BooleanInput source="plugins.clients" />
      <BooleanInput source="plugins.brandMerchants" />
      <BooleanInput source="plugins.files" />
      <BooleanInput source="plugins.gasBrandMerchants" />
      <BooleanInput source="plugins.merchantPaymentGateways" />
      <BooleanInput source="plugins.smsServices" />
      <BooleanInput source="plugins.support" />
      <BooleanInput source="plugins.notifications" />
      <BooleanInput source="plugins.designEditor" />
      <BooleanInput source="plugins.pageEditor" />
      <BooleanInput source="plugins.blocksEditor" />
      <BooleanInput source="plugins.tagsEditor" />
      <BooleanInput source="plugins.categoriesEditor" />
    </>
  );
};

const ChooseDesign = () => {
  const { record } = useEditContext();

  return (
    <ReferenceInput
      source="design_id"
      reference="Design"
      filter={{
        merchant_id: record.id,
      }}
    >
      <SelectInput optionText="name" optionValue="id" />
    </ReferenceInput>
  );
};

const editMerchant = () => (
  <Edit
    redirect="show"
    title={<Title source="name" />}
    mutationMode="pessimistic"
  >
    <TabbedForm toolbar={<CustomToolbar />}>
      <TabbedForm.Tab label="resources.Merchant.source.tab.basic">
        <TextField source="name" />
        <ChooseDesign />
        <SelectInput
          source="status"
          validate={[required()]}
          choices={Object.keys(MERCHANT_STATUSES).map((status) => ({
            id: status,
            name: `resources.Merchant.source.status.${status}`,
          }))}
        />
        <TextInput
          source="storage_capacity"
          type="number"
          min={0}
          max={1000}
          validate={[capacityRegex, required(), minValue(0), maxValue(1000)]}
        />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="resources.Merchant.source.tab.plugins">
        <ShowPlugins />
      </TabbedForm.Tab>
    </TabbedForm>
  </Edit>
);

export default editMerchant;
