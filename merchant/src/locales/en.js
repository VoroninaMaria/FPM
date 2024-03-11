import englishMessages from "ra-language-english";
const shared = {
  id: "ID",
  name: "Name",
  login: "Login",
  created_at: "Created at",
  updated_at: "Updated at",
  status: "Status",
  merchant_id: "Merchant",
  config: "Config",
  url: "Show",
  mimetype: "File Type",
  gas_brand_id: "Gas Brand",
};

const en = {
  ...englishMessages,
  login: { required: "Please log in" },
  buttons: {
    delete: "Delete",
    edit: "Edit",
    close_editing: "Close editing",
  },
  directions: {
    center: "Center",
    top: "Top",
    bottom: "Bottom",
    left: "Left",
    right: "Right",
  },
  resizeMode: {
    cover: "Cover",
    contain: "Contain",
    stretch: "Stretch",
    repeat: "Repeat",
    center: "Center",
  },
  objectFit: {
    cover: "Cover",
    contain: "Contain",
    fill: "Fill",
    scaleDown: "Scale-down",
  },
  fontStyle: {
    normal: "Normal",
    italic: "Italic",
  },
  alignItems: {
    center: "Center",
    "flex-start": "Top",
    "flex-end": "Bottom",
  },
  justifyContent: {
    center: "Center",
    "flex-start": "Left",
    "flex-end": "Right",
  },
  textAlign: {
    center: "Center",
    start: "Left",
    end: "Right",
  },
  resources: {
    Dashboard: {
      name: "Dashboard",
      skip: "Skip",
    },
    Trunc: {
      name: "Truncs",
      fields: {
        ...shared,
        merchant_payment_gateway_id: "Merchant Payment Gateway",
        client_id: "Client",
        description: "Description",
        short_description: "Short description",
        amount: "Amount",
        transactions: "Transactions",
      },
      source: {
        finishPayment: "Finish payment",
        info: "Info",
        succeed: "Payment succeeded",
      },
    },
    DatexTransaction: {
      name: "Transactions",
      fields: {
        fn_card_owner: "Card owner full name",
        amount: "Amount",
        sum: "Sum",
        n_accounts_struc: "Fuel type",
        n_service_station: "Service station",
        address: "Address",
        n_issuers: "Issuers",
        confirm_status: "Confirm status",
        session_time: "Session time",
      },
    },
    Promotion: {
      name: "Promotion",
      fields: {
        ...shared,
        file_id: "File",
        title: "Title",
        text: "Text",
      },
    },
    PaymentGateway: {
      name: "Payment Gateway",
      fields: {
        ...shared,
      },
    },
    MerchantPaymentGateway: {
      name: "Merchant Payment Gateway",
      fields: {
        ...shared,
        default: "Set as Default",
        payment_gateway_id: "Payment Gateway",
      },
    },
    Design: {
      name: "Design",
      fields: {
        ...shared,
        default_page_id: "Default page",
        error_page_id: "Error page",
        authenticated_page_id: "Authenticated page",
        loader_page_id: "Loader page",
        styles: {
          backgroundColor: "Background color",
          color: "Text color",
          borderColor: "Border color",
          justifyContent: "Horizontal alignment",
          alignItems: "Vertical alignment",
        },
      },
    },
    Page: {
      name: "Page",
      fields: {
        ...shared,
        design_id: "Design",
        styles: {
          backgroundColor: "Background color",
          color: "Text color",
          justifyContent: "Horizontal alignment",
          alignItems: "Vertical alignment",
        },
      },
      source: {
        tab: {
          basic: "Basic",
          preview: "Preview",
        },
      },
    },
    Block: {
      name: "Block",
      fields: {
        ...shared,
        type: "Type",
        position: "Position",
        blocks: "Blocks",
        container_styles: {
          backgroundColor: "Background color",
          alignItems: "Align items",
          justifyContent: "Justify content",
        },
        styles: {
          textAlignVertical: "Vertical text alignment",
          textAlign: "Text alignment",
          backgroundColor: "Background color",
          color: "Color",
          borderWidth: "Border width",
          width: "Width %",
          height: "Height %",
          borderRadius: "Border radius",
          fontSize: "Font size",
          fontWeight: "Font weight",
          alignItems: "Align Items",
          fontStyle: "Font style",
          placeholderTextColor: "Placeholder text color",
          objectFit: "Object fit",
          borderColor: "Border color",
          resizeMode: "Resize mode",
        },
        props: {
          text: "Text",
          action: "Action",
          redirect_page_id: "Redirect on click",
          uri: "Image",
          file_id: "File",
        },
      },
      source: {
        type: {
          Button: "Button",
          EmptyBlock: "Empty block",
          Image: "Image",
          PhoneInput: "Phone input",
          Text: "Text",
          TextInput: "Text input",
        },
        tab: {
          basic: "Basic",
          containerStyles: "Container styles",
          blockProps: "Block props",
        },
      },
    },
    File: {
      name: "Files",
      fields: {
        ...shared,
        attachments: "Attachments",
        size: "Size (MB)",
        link: "Link",
      },
      source: {
        mimetype: {
          "image/webp": "WEBP",
          "image/png": "PNG",
          "image/svg+xml": "SVG",
          "application/pdf": "PDF",
        },
      },
    },
    Merchant: {
      name: "Merchant",
      fields: {
        ...shared,
        current_password: "Current password",
        new_password: "New password",
        storage_capacity: "File storage capacity (MB)",
        design_id: "Design",
        newbie: "Newbie",
      },
      source: {
        status: {
          active: "active",
          inactive: "inactive",
          disabled: "disabled",
          blocked: "blocked",
          error: "error",
        },
      },
    },
    Chat: {
      name: "Chats",
      fields: {
        ...shared,
        input: {
          placeholder: "Type your message",
        },
      },
    },
    Brand: {
      name: "Brand",
      fields: {
        ...shared,
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
          blocked: "blocked",
          error: "error",
        },
        tab: {
          basic: "Basic",
          confirm_changes: "Confirm changes",
        },
      },
    },
    BrandMerchant: {
      name: "Brand Merchants",
      fields: {
        ...shared,
        id: "Brand Merchant ID",
        brand_id: "Brand",
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
        },
      },
    },
    GasBrandMerchant: {
      name: "Gas Brand Merchant",
      fields: {
        ...shared,
        fuels: "Fuels",
      },
      fuels: {
        name: "Name",
        regular_price: "Regular Price (kop)",
        discount_price: "Discount Price (kop)",
        status: "Status",
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
          blocked: "blocked",
        },
      },
    },
    Client: {
      name: "Clients",
      fields: {
        ...shared,
        phone: "Phone",
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        password: "Password",
        category_id: "Category",
        tag_ids: "Tags",
        city: "City",
        address: "Address",
        entity: "Client entity",
        balance: "Balance",
        unconfirmed_changes: {
          name: "Changes",
          field_name: "Field name",
          value: "Value",
          status: "Status",
        },
        transactions: {
          fn_card_owner: "Card owner full name",
          amount: "Amount",
          sum: "Sum",
          n_accounts_struc: "Fuel type",
          n_service_station: "Service station",
          address: "Address",
          n_issuers: "Issuers",
          confirm_status: "Confirm status",
          session_time: "Session time",
        },
        payment_transactions: {
          client_fn: "Card owner full name",
          s_docums: "Amount",
          payment_note: "Payment description",
          status: "Status",
          session_time: "Session time",
        },
      },
      source: {
        status: {
          initial: "initial",
          confirmed: "confirmed",
          disabled: "disabled",
          blocked: "blocked",
        },
        changes_status: {
          pending: "pending",
          confirmed: "confirmed",
          rejected: "rejected",
        },
        payment_status: {
          1: "success",
        },
        unconfirmed_changes_fields: {
          field_name: "Field name",
          value: "Value",
          status: "Status",
        },
        tab: {
          basic: "Basic",
          confirm_changes: "Confirm changes",
        },
        infoTab: {
          info: "Client Info",
          transactions: "Transactions",
          payment_transactions: "Topup",
        },
        entity: {
          physical: "Physical entity",
          legal: "Legal entity",
        },
      },
    },
    SmsService: {
      name: "Sms Services",
      fields: {
        ...shared,
        service_name: "Service name",
        config: {
          name: "Config",
          key: "API key",
          sender: "Sender",
        },
        balance: "Balance",
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
          blocked: "blocked",
          error: "error",
        },
      },
    },
    Category: {
      name: "Categories",
      fields: {
        ...shared,
        name: "Name",
      },
    },
    Tag: {
      name: "Tags",
      fields: {
        ...shared,
      },
    },
    notifications: {
      errors: {
        Forbidden: "An error has occured",
        delete_error: "Element can not be deleted!",
        already_exist: "Element already exists!",
        name_of_fuel_already_exist: "Fuel already exists!",
        dublicate_name_of_fuel_update: "Entered duplicate fuel names",
        page_set_as_default:
          "Page is set as design's default, remove it from there before performing deletion",
        oversize: "File size shouldn't exceed 10MB",
        min_length: "Password should be at least 4 characters long",
        max_length: "Password should be at less then 10 characters",

        not_match: "Current password does not match",
        password_required: "Password is required!",
        current_required: "Current password is required!",
        invalid_phone_format:
          "Invalid phone format, it should start with 380 and not include + sign",
        invalid_email_format: "Invalid email format",
        no_free_space:
          "No free space left, please delete some files before upload",
        forbidden_filetype:
          "Filetype not supported, allowed file extentions: .png, .svg, .webp, .pdf",
        invalid_syntax: "Element doesn't follow the required syntax",
        file_in_use: "Cannot delete file currently in use",
        default_not_found: "Default payment gateway already choosen",
        password_is_required: "Password is required",
        can_not_edit: "Can't update with status blocked",
        can_not_edit_parent: "Can't update, parent element with status blocked",
        is_not_avilable: "Choosen element is not avilable",
      },
      confirm: {
        delete: "Are you sure you want to delete this item?",
      },
    },
  },
};

export default en;
