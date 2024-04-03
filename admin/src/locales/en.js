import englishMessages from "ra-language-english";
const shared = {
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
    edit: "Edit",
    close_editing: "Close editing",
    delete: "Delete",
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
    Membership: {
      name: "Memberships",
      fields: {
        name: "Name",
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
          blocked: "blocked",
          inactive: "inactive",
        },
      },
    },
    Company: {
      name: "Companies",
      fields: {
        ...shared,
        name: "Companies",
        brand_merchant_id: "Brand Merchant",
      },
    },
    Manager: {
      name: "Managers",
      fields: {
        ...shared,
        company_id: "Companies",
        client_id: "Clients",
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
          fontStyle: "Font style",
          backgroundColor: "Background color",
          alignItems: "Align Items",
          color: "Color",
          borderWidth: "Border width",
          width: "Width %",
          height: "Height %",
          borderRadius: "Border radius",
          fontSize: "Font size",
          fontWeight: "Font weight",
          objectFit: "Object fit",
          resizeMode: "Resize mode",
          placeholderTextColor: "Placeholder text color",
          borderColor: "Border color",
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
        account_id: "Merchant",
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
    Admin: {
      name: "Admin",
      fields: {
        ...shared,
        current_password: "Current password",
        new_password: "New password",
      },
    },
    PaymentGateway: {
      name: "PaymentGateway",
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
      },
    },
    MerchantPaymentGateway: {
      name: "Merchant Payment Gateway",
      fields: {
        ...shared,
        default: "Set as Default",
        payment_gateway_id: "Payment Gateway",
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
    Brand: {
      name: "Brand",
      fields: {
        ...shared,
        default_config: "Default config",
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
    GasBrand: {
      name: "Gas Brand",
      fields: {
        ...shared,
        logo_file_id: "Logo",
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
    BrandMerchant: {
      name: "Brand Merchants",
      fields: {
        ...shared,
        brand_id: "Brand",
      },
      source: {
        status: {
          active: "active",
          disabled: "disabled",
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
    Client: {
      name: "Clients",
      fields: {
        ...shared,
        phone: "Phone",
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        category_id: "Category",
        tag_ids: "Tags",
        company_id: "Companies",
        unconfirmed_changes: {
          name: "Changes",
          field_name: "Field name",
          value: "Value",
          status: "Status",
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
        tab: {
          basic: "Basic",
          confirm_changes: "Confirm changes",
        },
      },
    },
    Merchant: {
      name: "Merchants",
      fields: {
        ...shared,
        storage_capacity: "Storage capacity (MB)",
        password: "Password",
        design_id: "Design",
        plugins: {
          datex: "Plugins Datex",
          clients: "Plugins Clients",
          brandMerchants: "Plugins Brand Merchants",
          files: "Plugins Files",
          gasBrandMerchants: "Plugins Gas Brand Merchants",
          paymentGateways: "Plugins Payment Gateways",
          merchantPaymentGateways: "Plugins Merchant Payment Gateways",
          transactions: "Plugins Transactions",
          smsServices: "Plugins Sms Services",
          support: "Plugins Support",
          notifications: "Plugins Notifications",
          designEditor: "Plugins Design editor",
          pageEditor: "Plugins Page editor",
          blocksEditor: "Plugins Blocks editor",
          tagsEditor: "Plugins Tags editor",
          categoriesEditor: "Plugins Categories editor",
        },
      },
      source: {
        status: {
          active: "active",
          inactive: "inactive",
          disabled: "disabled",
          blocked: "blocked",
        },
        tab: {
          basic: "Basic",
          plugins: "Plugins",
        },
        plugins: "Plugins",
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
        name_of_abilities_already_exist: "Abilities already exists!",
        dublicate_name_of_abilities_update: "Entered duplicate abilities names",
        page_set_as_default:
          "Page is set as design's default, remove it from there before performing deletion",
        oversize: "File size shouldn't exceed 10MB",
        min_length: "Password should be at least 4 characters",
        max_length: "Password should be at less then 10 characters",
        not_match: "Current password does not match",
        no_free_space:
          "No free space left, please delete some files before upload",
        forbidden_filetype:
          "Filetype not supported, allowed file extentions: .png, .svg, .webp, .pdf",
        forbidden_image_type:
          "Filetype not supported, allowed file extentions: .png, .svg",
        invalid_syntax: "Element doesn't follow the required syntax",
        file_in_use: "Cannot delete file currently in use",
        default_not_found: "Merchant Payment Gateway by default already set",
        invalid_phone_format:
          "Invalid phone format, it should start with 380 and not include + sign",
        invalid_email_format: "Invalid email format",
        enable_datex: "Enable Datex first",
        invalid_client: "Client not found",
        category_not_found: "Category not found",
        specified_tag_doesnt_exist: "Tag not found",
        datex_not_found:
          "Datex not exist. Please connect Datex in your Brand Merchants first",
      },
      confirm: {
        delete: "Are you sure you want to delete this item?",
      },
    },
  },
};

export default en;
