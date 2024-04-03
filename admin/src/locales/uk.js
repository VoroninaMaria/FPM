import ukrainianMessages from "ra-language-ukrainian";
const shared = {
  name: "Назва",
  login: "Логін",
  created_at: "Створено",
  updated_at: "Останні зміни",
  status: "Статус",
  merchant_id: "Мерчант",
  gas_brand_id: "Заправка",
  config: "Налаштування",
  url: "Перегляд",
  mimetype: "Тип файла",
};

const uk = {
  ...ukrainianMessages,
  login: { required: "Увійдіть в кабінет" },
  buttons: {
    edit: "Редагувати",
    close_editing: "Закінчити редагування",
    delete: "Видалити",
  },
  resources: {
    Membership: {
      name: "Абонементи",
      fields: {
        name: "Назва",
      },
      source: {
        status: {
          active: "активний",
          disabled: "деактивований",
          blocked: "заблокований",
          inactive: "неактивний",
        },
      },
    },

    File: {
      name: "Файли",
      fields: {
        ...shared,
        account_id: "Мерчант",
        attachments: "Вкладення",
        size: "Розмір (МБ)",
        link: "Посилання",
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
      name: "Адміністратор",
      fields: {
        ...shared,
        current_password: "Пароль",
        new_password: "Новий пароль",
      },
    },
    PaymentGateway: {
      name: "Платіжні системи",
      fields: {
        ...shared,
      },
      source: {
        status: {
          active: "активний",
          disabled: "деактивований",
          blocked: "заблокований",
          error: "помилка",
        },
      },
    },
    MerchantPaymentGateway: {
      name: "Еквайрінги Мерчантів",
      fields: {
        ...shared,
        id: "ID Платіжного шлюзу Мерчанта",
        payment_gateway_id: "Платіжний шлюз",
        default: "За замовчуванням",
      },
      source: {
        status: {
          active: "активний",
          disabled: "деактивований",
          blocked: "заблокований",
          error: "помилка",
        },
      },
    },

    BrandMerchant: {
      name: "Інтеграції Мерчантів",
      fields: {
        ...shared,
        brand_id: "Інтеграція",
      },
      source: {
        status: {
          active: "активний",
          disabled: "деактивований",
        },
      },
    },
    Client: {
      name: "Користувачі",
      fields: {
        ...shared,
        phone: "Телефон",
        first_name: "Ім'я",
        last_name: "Прізвище",
        email: "Пошта",
        category_id: "Категорія",
        tag_ids: "Теги",
        company_id: "Компанії",
        unconfirmed_changes: {
          name: "Зміни",
          field_name: "Назва поля",
          value: "Значення",
          status: "Статус",
        },
      },
      source: {
        status: {
          initial: "активний",
          confirmed: "підтверджений",
          disabled: "деактивований",
          blocked: "заблокований",
        },
        changes_status: {
          pending: "очікує",
          confirmed: "підтверджено",
          rejected: "відхилено",
        },
        tab: {
          basic: "Базові налаштування",
          confirm_changes: "Підтвердження змін",
        },
      },
    },
    Merchant: {
      name: "Мерчанти",
      fields: {
        ...shared,
        storage_capacity: "Об'єм файлового сховища (МБ)",
        password: "Пароль",
        design_id: "Дизайн",
        plugins: {
          datex: "Датекс",
          clients: "Користувачі",
          brandMerchants: "Інтеграції мерчантів",
          files: "Файли",
          gasBrandMerchants: "Заправки Мерчантів",
          paymentGateways: "Платіжні системи",
          merchantPaymentGateways: "Еквайрінги",
          transactions: "Транзакції",
          smsServices: "Смс Сервіси",
          support: "Служба підтримки",
          notifications: "Сповіщення",
          designEditor: "Конструктор дизайнів",
          pageEditor: "Конструктор сторінок",
          blocksEditor: "Конструктор блоків",
          tagsEditor: "Редактор тегів",
          categoriesEditor: "Редактор категорій",
        },
      },
      source: {
        status: {
          active: "активний",
          inactive: "неактивний",
          disabled: "деактивований",
          blocked: "заблокований",
        },
        tab: {
          basic: "Базові налаштування",
          plugins: "Розширення",
        },
        plugins: "Розширення",
      },
    },
    SmsService: {
      name: "Смс Сервіси",
      fields: {
        ...shared,
        service_name: "Назва сервісу",
        config: {
          name: "Налаштування",
          key: "АРІ ключ",
          sender: "Відправник",
        },
        balance: "Баланс",
      },
      source: {
        status: {
          active: "активний",
          disabled: "деактивований",
          blocked: "заблокований",
          error: "помилка",
        },
      },
    },

    Category: {
      name: "Категорії",
      fields: {
        ...shared,
      },
    },
    Tag: {
      name: "Теги",
      fields: {
        ...shared,
      },
    },
    notifications: {
      errors: {
        Forbidden: "Виникла помилка",
        delete_error: "Елемент не може бути видалено!",
        already_exist: "Елемент вже існує",
        name_of_fuel_already_exist: "Паливо вже існує",
        dublicate_name_of_fuel_update: "Введено однакові назви палива",
        page_set_as_default:
          "Сторінка встановлена в дизайні за замовчуванням, змініть налаштування дизайну, щоб мати можливість видалити цю сторінку",
        oversize: "Файл не може бути більше 10МВ",
        min_length: "Пароль має бути мінімум 4 символи",
        max_length: "Пароль має бути меньше 10 символів",
        not_match: "Пароль невірний",
        no_free_space:
          "Недостатньо вільного місця, видаліть непотрібні файли перш ніж продовжити",
        forbidden_filetype:
          "Розширення файлу не підтримується, список доступних розширень: .png, .svg, .webp, .pdf",
        forbidden_image_type:
          "Розширення файлу не підтримується, список доступних розширень: .png, .svg",
        invalid_syntax: "Даний синтаксис не підтримується",
        file_in_use:
          "Неможливо видалити файл що в даний момент використовується",
        default_not_found: "Еквайрінг за замовчуванням вже обраний",
        invalid_phone_format:
          "Невірний формат телефону, він повинен починатись з 380 та не включати в себе +",
        invalid_email_format: "Некоректний правопис електронної пошти",
        enable_datex: "Спочатку вимкніть Датекс",
        invalid_client: "Користувача не існує",
        category_not_found: "Категорію не знайдено",
        specified_tag_doesnt_exist: "Тег не знайдено",
        datex_not_found:
          "Датекс не підключений. Будь ласка, підключіть Датекс в Інтеграції Мерчантів",
      },
      confirm: {
        delete: "Ви впевнені, що хочете видалити цей елемент?",
      },
    },
  },
};

export default uk;
