import * as React from "react";
import {
  Show,
  Datagrid,
  TabbedShowLayout,
  SimpleShowLayout,
  TextField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  useTranslate,
  FunctionField,
  ArrayField,
  NumberField,
  Pagination,
  TopToolbar,
  Filter,
  TextInput,
  NumberInput,
  useGetOne,
  useNotify,
} from "react-admin";
import {
  DateField,
  Title,
  ShowOnlyTopToolbar,
  Loader,
} from "../../shared/components/index.js";

const DatexTransactionFilter = (props) => (
  <TopToolbar>
    <Filter {...props}>
      <TextInput
        source="fn_card_owner"
        label="resources.Client.fields.transactions.fn_card_owner"
        alwaysOn
      />
      <TextInput
        source="n_accounts_struc"
        label="resources.Client.fields.transactions.n_accounts_struc"
        alwaysOn
      />
      <NumberInput
        source="amount"
        label="resources.Client.fields.transactions.amount"
        alwaysOn
      />
      <NumberInput
        source="sum"
        label="resources.Client.fields.transactions.sum"
        alwaysOn
      />
    </Filter>
  </TopToolbar>
);

const DatexClient = () => {
  const t = useTranslate();
  const TabbedShowLayoutTabs = () => (
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="resources.Client.source.infoTab.info">
        <TextField source="phone" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <TextField source="email" />
        <NumberField source="balance" />
        <FunctionField
          source="entity"
          render={(record) => {
            if (record.entity === 1) {
              return t("resources.Client.source.entity.physical");
            }

            if (record.entity === 2) {
              return t("resources.Client.source.entity.legal");
            }
          }}
        />
        <TextField source="city" />
        <TextField
          source="address"
          style={{
            display: "inline-block",
            maxWidth: "15em",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Client.source.status.${record.status}`)
          }
        />
        <ArrayField
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
        >
          <Datagrid optimized bulkActionButtons={null}>
            <TextField
              source="field_name"
              label="resources.Client.fields.unconfirmed_changes.field_name"
            />
            <TextField
              source="value"
              label="resources.Client.fields.unconfirmed_changes.value"
            />
            <FunctionField
              source="status"
              render={(record) =>
                t(`resources.Client.source.changes_status.${record.status}`)
              }
            />
          </Datagrid>
        </ArrayField>
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="resources.Client.source.infoTab.transactions">
        <ArrayField
          perPage={10}
          source="transactions"
          label="resources.Client.source.infoTab.transactions"
        >
          <Show
            title={<Title source="fn_card_owner" />}
            actions={<DatexTransactionFilter />}
          >
            <Datagrid bulkActionButtons={false}>
              <NumberField source="id" />
              <TextField
                source="fn_card_owner"
                label="resources.Client.fields.transactions.fn_card_owner"
              />
              <NumberField
                source="amount"
                label="resources.Client.fields.transactions.amount"
              />
              <NumberField
                source="sum"
                label="resources.Client.fields.transactions.sum"
              />
              <TextField
                source="n_accounts_struc"
                label="resources.Client.fields.transactions.n_accounts_struc"
              />
              <TextField
                source="n_service_station"
                label="resources.Client.fields.transactions.n_service_station"
              />
              <TextField
                source="address"
                label="resources.Client.fields.transactions.address"
              />
              <TextField
                source="n_issuers"
                label="resources.Client.fields.transactions.n_issuers"
              />
              <NumberField
                source="confirm_status"
                label="resources.Client.fields.transactions.confirm_status"
              />
              <DateField
                source="session_time"
                label="resources.Client.fields.transactions.session_time"
              />
            </Datagrid>
            <Pagination />
          </Show>
        </ArrayField>
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="resources.Client.source.infoTab.payment_transactions">
        <ArrayField
          perPage={10}
          source="payment_transactions"
          label="resources.Client.source.infoTab.payment_transactions"
        >
          <Datagrid bulkActionButtons={false}>
            <TextField
              source="client_fn"
              label="resources.Client.fields.payment_transactions.client_fn"
            />
            <TextField
              source="payment_note"
              label="resources.Client.fields.payment_transactions.payment_note"
            />
            <FunctionField
              source="status"
              render={(record) => {
                if (record.status === 1) {
                  return t(
                    `resources.Client.source.payment_status.${record.status}`
                  );
                }
              }}
            />
            <NumberField
              source="s_docums"
              textAlign="center"
              label="resources.Client.fields.payment_transactions.s_docums"
            />

            <DateField
              source="session_time"
              label="resources.Client.fields.payment_transactions.session_time"
            />
          </Datagrid>
          <Pagination />
        </ArrayField>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  );

  return (
    <Show title={<Title source="phone" />} actions={<ShowOnlyTopToolbar />}>
      <TabbedShowLayout
        tabs={
          <TabbedShowLayoutTabs variant="scrollable" scrollButtons={false} />
        }
      />
    </Show>
  );
};

const Client = () => {
  const t = useTranslate();

  return (
    <Show title={<Title source="phone" />} actions={<ShowOnlyTopToolbar />}>
      <SimpleShowLayout>
        <TextField source="phone" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <TextField source="email" />
        <ReferenceField source="category_id" reference="Category" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceArrayField source="tag_ids" reference="Tag">
          <SingleFieldList linkType="show">
            <ChipField source="name" size="small" />
          </SingleFieldList>
        </ReferenceArrayField>
        <FunctionField
          source="status"
          render={(record) =>
            t(`resources.Client.source.status.${record.status}`)
          }
        />

        <ArrayField
          source="unconfirmed_changes"
          label="resources.Client.fields.unconfirmed_changes.name"
        >
          <Datagrid optimized bulkActionButtons={null}>
            <TextField
              source="field_name"
              label="resources.Client.fields.unconfirmed_changes.field_name"
            />
            <TextField
              source="value"
              label="resources.Client.fields.unconfirmed_changes.value"
            />
            <FunctionField
              source="status"
              render={(record) =>
                t(`resources.Client.source.changes_status.${record.status}`)
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

const showClient = () => {
  const notify = useNotify();
  const {
    data: merchant,
    error,
    isLoading,
  } = useGetOne("Merchant", {
    id: localStorage.getItem("id"),
  });

  if (isLoading) return <Loader />;
  if (error) {
    return notify(`resources.notifications.errors.${error.message}`, {
      type: "error",
    });
  }

  if (!error && merchant?.plugins.datex) {
    return <DatexClient />;
  }

  return <Client />;
};

export default showClient;
