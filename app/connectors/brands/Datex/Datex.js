import knex from "knex";
import { GraphQLError } from "graphql";
const qrCardDefaultParams = {
    prefix: "23377+",
    serialLength: 7,
    maxCountCards: null,
    hoursNextCreate: null,
    internalCardLength: 19,
};
class Datex {
    knex;
    constructor(connection) {
        this.knex = knex({
            debug: true,
            client: "pg",
            connection,
            searchPath: ["engine", "gate", "logs", "sync", "public"],
            useNullAsDefault: true,
        });
    }
    createClient = async (params) => this.knex
        .select("*")
        .from(this.knex.raw("exs_add_client(:euid,:fullName,:shortName, :ownership, null,null, :etalonId, null, null)", params))
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    createClientAccount = async (params) => this.knex("accounts")
        .insert({ ...params })
        .returning("*")
        .then(([account]) => account)
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getClientAccount = async (account_owner) => this.knex("accounts")
        .select("*")
        .where({ account_owner, active: true })
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    updateClient = async (params) => this.knex("clients")
        .update({ ...params })
        .where({ id_clients: params.id_clients })
        .returning("*")
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    createQRCard = async (in_id_client) => this.knex
        .select("*")
        .from(this.knex.raw("wngp_create_qr_card(:in_id_client::integer, :in_params::jsonb)", {
        in_id_client,
        in_params: JSON.stringify(qrCardDefaultParams),
    }))
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    updateQRCardPin = async (card_id, new_pin) => this.knex("cards")
        .where({ id: card_id })
        .update({ pin1: new_pin })
        .returning("*")
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getClientQRCard = async (card_owner) => this.knex("cards")
        .select("*")
        .where({ card_owner })
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getClientJurQRCard = async (code_edroup, phone) => this.knex("clients")
        .select("*")
        .where({ code_edroup })
        .first()
        .then((user) => this.knex("cards")
        .select("*")
        .where({ card_owner: user.id_clients, phone: phone })
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    }))
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    createQRCardAccount = async (in_id_card) => this.knex
        .select("*")
        .from(this.knex.raw("cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)", {
        in_id_card,
        in_id_accounts_struc: 95,
    }))
        .first()
        .then(() => this.knex
        .select("*")
        .from(this.knex.raw("cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)", {
        in_id_card,
        in_id_accounts_struc: 133,
    }))
        .first()
        .then(() => this.knex
        .select("*")
        .from(this.knex.raw("cards_account_create(:in_id_card::integer, :in_id_accounts_struc::integer)", {
        in_id_card,
        in_id_accounts_struc: 1001,
    }))
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    }))
        .catch(() => {
        throw new GraphQLError("Forbidden");
    }))
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    clientIdByExternalId = async (external_id) => this.knex("clients")
        .select("id_clients")
        .where({ external_id })
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getBalance = async (account_owner) => this.knex("accounts")
        .select("balance")
        .where({ account_owner, active: true })
        .first()
        .catch((error) => {
        throw new GraphQLError(`Forbidden: ${error}`);
    });
    updateBalance = async (params) => this.knex
        .select("*")
        .from(this.knex.raw("exs_create_payment_doc(:in_external_doc_id,:in_id_clients,:in_id_account,:in_session_time,:in_summ,4,:in_note,1)", params))
        .first()
        .catch((error) => {
        throw new GraphQLError(`Forbidden: ${error}`);
    });
    getClient = async (phones) => this.knex("clients")
        .select("*")
        .where({ phones })
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getClients = async ({ filter, }) => this.knex("clients")
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
    getTotalClients = async (filter) => this.knex("clients")
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
    getClientTransactions = async (filter, card_owner) => this.knex("transactions_ps")
        .select("*")
        .where({ ...filter, card_owner })
        .orderBy("id", "desc")
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getClientTopUpTransactions = async (filter, id_clients) => this.knex("docums")
        .select("*")
        .where({ ...filter, id_clients })
        .orderBy("id_docums", "desc")
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getTransactionById = async (id) => this.knex("transactions_ps")
        .select("*")
        .where({ id })
        .orderBy("id", "desc")
        .first()
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getAllTransactions = async ({ page = 0, per_page = 10, sort_field = "id", sort_order = "desc", filter, }) => this.knex("transactions_ps")
        .select("*")
        .where(this.knex.raw("card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"))
        .where({ ...filter })
        .modify((queryBuilder) => Object.entries(filter).forEach(([field, value]) => {
        if (field === "fn_card_owner" || field === "n_accounts_struc") {
            queryBuilder
                .orWhereLike(field, `%${value}%`)
                .where(this.knex.raw("card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"));
        }
        if (field === "amount" && value) {
            queryBuilder.where(this.knex.raw(`${field} >= ${value}`));
        }
    }))
        .limit(per_page)
        .offset(page * per_page)
        .orderBy(sort_field, sort_order)
        .catch(() => {
        throw new GraphQLError("Forbidden");
    });
    getTotalTransactions = async (filter) => this.knex("transactions_ps")
        .where(this.knex.raw("card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"))
        .where({ ...filter })
        .modify((queryBuilder) => Object.entries(filter).forEach(([field, value]) => {
        if (field === "fn_card_owner" || field === "n_accounts_struc") {
            queryBuilder
                .orWhereLike(field, `%${value}%`)
                .where(this.knex.raw("card_owner IN (SELECT id_clients FROM clients WHERE external_id IS NOT NULL)"));
        }
        if (field === "amount" && value) {
            queryBuilder.where(this.knex.raw(`${field} >= ${value}`));
        }
    }))
        .count("*");
    close = async () => {
        await this.knex.destroy();
    };
}
export default Datex;
