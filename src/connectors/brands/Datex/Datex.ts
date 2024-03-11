import knex from "knex";
import type { Knex } from "knex";
import type { DatexConnection } from "./types";
import { GraphQLError } from "graphql";

type CreateClientParams = {
  euid: string;
  fullName: string;
  shortName: string;
  inCodeEdroup: "100000000000";
  ownership: 1 | 2 | 3;
  etalonId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};
type CreateClientResult = {
  out_result: number;
  out_id_client: number;
};

type UpdateClientParams = {
  id_clients: number;
  fn_clients: string | null;
  sn_clients: string | null;
  phones: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
};

type CreateClientAccountParams = {
  account: 1;
  account_owner: number;
  day_limit: number;
  day_limit_rest: number;
  month_limit: number;
  month_limit_rest: number;
  title: string;
  active: boolean;
  is_main_account: boolean;
  version_id: number;
};

type ClientResponse = {
  [name: string]: any;
};

type UpdateBalanceParams = {
  in_external_doc_id: string;
  in_id_clients: number;
  in_id_account: number;
  in_session_time: string;
  in_summ: number;
  in_id_source: 4;
  in_note: string;
  in_id_vid_docums: 1;
};

type updateBalanceResult = {
  out_result: number;
  out_id_docum: number;
  out_id_transaction: number;
  out_insert_datetime: string;
};

type QRCardParams = {
  prefix: string;
  serialLength: number;
  maxCountCards: number | null;
  hoursNextCreate: number | null;
  internalCardLength: number;
};

const qrCardDefaultParams: QRCardParams = {
  prefix: "23377+",
  serialLength: 7,
  maxCountCards: null,
  hoursNextCreate: null,
  internalCardLength: 19,
};

type QRCardResponse = {
  [name: string]: any;
};

type TransactionInfo = {
  [name: string]: any;
};

type AllTransactionsResponse = {
  [name: string]: any;
};

class Datex {
  private knex: Knex;
  constructor(connection: DatexConnection) {
    this.knex = knex({
      debug: true,
      client: "pg",
      connection,
      searchPath: ["engine", "gate", "logs", "sync", "public"],
      useNullAsDefault: true,
    });
  }

  public createClient = async (
    params: CreateClientParams
  ): Promise<CreateClientResult[]> =>
    this.knex
      .select("*")
      .from(
        this.knex.raw(
          "exs_add_client(:euid,:fullName,:shortName, :ownership, null,null, :etalonId, null, null)",
          params
        )
      )
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public createClientAccount = async (
    params: CreateClientAccountParams
  ): Promise<ClientResponse> =>
    this.knex("accounts")
      .insert({ ...params })
      .returning("*")
      .then(([account]) => account)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClientAccount = async (
    account_owner: number
  ): Promise<ClientResponse> =>
    this.knex("accounts")
      .select("*")
      .where({ account_owner, active: true })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public updateClient = async (
    params: UpdateClientParams
  ): Promise<ClientResponse> =>
    this.knex("clients")
      .update({ ...params })
      .where({ id_clients: params.id_clients })
      .returning("*")
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public createQRCard = async (in_id_client: number): Promise<number> =>
    this.knex
      .select("*")
      .from(
        this.knex.raw(
          "wngp_create_qr_card(:in_id_client::integer, :in_params::jsonb)",
          {
            in_id_client,
            in_params: JSON.stringify(qrCardDefaultParams),
          }
        )
      )
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public updateQRCardPin = async (
    card_id: number,
    new_pin: string
  ): Promise<QRCardResponse> =>
    this.knex("cards")
      .where({ id: card_id })
      .update({ pin1: new_pin })
      .returning("*")
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClientQRCard = async (
    card_owner: number
  ): Promise<QRCardResponse> =>
    this.knex("cards")
      .select("*")
      .where({ card_owner })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClientJurQRCard = async (
    code_edroup: string,
    phone: string
  ): Promise<QRCardResponse> =>
    this.knex("clients")
      .select("*")
      .where({ code_edroup })
      .first()
      .then((user) =>
        this.knex("cards")
          .select("*")
          .where({ card_owner: user.id_clients, phone: phone })
          .first()
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      )
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public createQRCardAccount = async (
    in_id_card: number
  ): Promise<{ out_result: number; out_count_ok: number }> =>
    this.knex
      .select("*")
      .from(
        this.knex.raw(
          "cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)",
          {
            in_id_card,
            in_id_accounts_struc: 95,
          }
        )
      )
      .first()
      .then(() =>
        this.knex
          .select("*")
          .from(
            this.knex.raw(
              "cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)",
              {
                in_id_card,
                in_id_accounts_struc: 133,
              }
            )
          )
          .first()
          .then(() =>
            this.knex
              .select("*")
              .from(
                this.knex.raw(
                  "cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)",
                  {
                    in_id_card,
                    in_id_accounts_struc: 1001,
                  }
                )
              )
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              })
          )
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      )
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public clientIdByExternalId = async (
    external_id: string
  ): Promise<{ id_clients: number }> =>
    this.knex("clients")
      .select("id_clients")
      .where({ external_id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getBalance = async (
    account_owner: number
  ): Promise<{ balance: number }> =>
    this.knex("accounts")
      .select("balance")
      .where({ account_owner, active: true })
      .first()
      .catch((error) => {
        throw new GraphQLError(`Forbidden: ${error}`);
      });

  public updateBalance = async (
    params: UpdateBalanceParams
  ): Promise<updateBalanceResult> =>
    this.knex
      .select("*")
      .from(
        this.knex.raw(
          "exs_create_payment_doc(:in_external_doc_id,:in_id_clients,:in_id_account,:in_session_time,:in_summ,4,:in_note,1)",
          params
        )
      )
      .first()
      .catch((error) => {
        throw new GraphQLError(`Forbidden: ${error}`);
      });

  public getClient = async (phones: string): Promise<ClientResponse> =>
    this.knex("clients")
      .select("*")
      .where({ phones })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClients = async ({
    filter,
  }: {
    filter: any;
  }): Promise<ClientResponse> =>
    this.knex("clients")
      .select("*")
      .where(this.knex.raw("phones is not null"))
      .modify((queryBuilder) => {
        if (filter.ids?.length) {
          return queryBuilder.whereIn("phones", filter.ids);
        }
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getTotalClients = async (filter: any): Promise<number> =>
    this.knex("clients")
      .where(this.knex.raw("phones is not null"))
      .modify((queryBuilder) => {
        if (filter.ids?.length) {
          return queryBuilder.whereIn("phones", filter.ids);
        }
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClientTransactions = async (
    filter: any,
    card_owner: number
  ): Promise<TransactionInfo[]> =>
    this.knex("transactions_ps")
      .select("*")
      .where({ ...filter, card_owner })
      .orderBy("id", "desc")
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getClientTopUpTransactions = async (
    filter: any,
    id_clients: number
  ): Promise<TransactionInfo[]> =>
    this.knex("docums")
      .select("*")
      .where({ ...filter, id_clients })
      .orderBy("id_docums", "desc")
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getTransactionById = async (id: number): Promise<TransactionInfo[]> =>
    this.knex("transactions_ps")
      .select("*")
      .where({ id })
      .orderBy("id", "desc")
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getAllTransactions = async ({
    page = 0,
    per_page = 10,
    sort_field = "id",
    sort_order = "desc",
    filter,
  }: {
    page: number;
    per_page: number;
    sort_field: string;
    sort_order: string;
    filter: any;
  }): Promise<AllTransactionsResponse[]> =>
    this.knex("transactions_ps")
      .select("*")
      .where(
        this.knex.raw(
          "card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"
        )
      )
      .where({ ...filter })
      .modify((queryBuilder) =>
        Object.entries(filter).forEach(([field, value]) => {
          if (field === "fn_card_owner" || field === "n_accounts_struc") {
            queryBuilder
              .orWhereLike(field, `%${value}%`)
              .where(
                this.knex.raw(
                  "card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"
                )
              );
          }
          if (field === "amount" && value) {
            queryBuilder.where(this.knex.raw(`${field} >= ${value}`));
          }
        })
      )
      .limit(per_page)
      .offset(page * per_page)
      .orderBy(sort_field, sort_order)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

  public getTotalTransactions = async (filter: any): Promise<number> =>
    this.knex("transactions_ps")
      .where(
        this.knex.raw(
          "card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"
        )
      )
      .where({ ...filter })
      .modify((queryBuilder) =>
        Object.entries(filter).forEach(([field, value]) => {
          if (field === "fn_card_owner" || field === "n_accounts_struc") {
            queryBuilder
              .orWhereLike(field, `%${value}%`)
              .where(
                this.knex.raw(
                  "card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"
                )
              );
          }
          if (field === "amount" && value) {
            queryBuilder.where(this.knex.raw(`${field} >= ${value}`));
          }
        })
      )
      .count("*");

  public close = async (): Promise<void> => {
    await this.knex.destroy();
  };
}
export default Datex;
