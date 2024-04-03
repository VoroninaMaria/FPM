import ukrainianMessages from "ra-language-ukrainian";
const shared = {
  id: "ID",
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
    delete: "Видалити",
    close_editing: "Закінчити редагування",
  },
  directions: {
    center: "Центр",
    top: "По верхньому краю",
    bottom: "По нижньому краю",
    left: "Ліворуч",
    right: "Праворуч",
  },
  resizeMode: {
    cover: "Повне покриття",
    contain: "Збереження співвідношення",
    stretch: "Розтягнення",
    repeat: "Повторення",
    center: "Центр",
  },
  objectFit: {
    cover: "Повне покриття",
    contain: "Збереження співвідношення",
    fill: "Заповнення",
    scaleDown: "Зменшення маштабу",
  },
  fontStyle: {
    normal: "Звичайний",
    italic: "Курсив",
  },
  alignItems: {
    center: "По центру",
    "flex-start": "По верхньому краю",
    "flex-end": "По нижньому краю",
  },
  justifyContent: {
    center: "По центру",
    "flex-start": "Ліворуч",
    "flex-end": "Праворуч",
  },
  textAlign: {
    center: "По центру",
    start: "Ліворуч",
    end: "Праворуч",
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
    Dashboard: {
      name: "Головна",
      skip: "Пропустити",
    },
    Trunc: {
      name: "Транк",
      fields: {
        ...shared,
        merchant_payment_gateway_id: "Еквайрінг",
        client_id: "Користувач",
        description: "Призначення платежу",
        short_description: "Короткий опис призначення",
        amount: "Сумма",
        transactions: "Транзакції",
      },
      source: {
        finishPayment: "Завершити оплату",
        info: "Інформація",
        succeed: "Платіж пройшов успішно",
      },
    },

    PaymentGateway: {
      name: "Платіжні шлюзи",
      fields: {
        ...shared,
      },
    },
    MerchantPaymentGateway: {
      name: "Еквайрінги",
      fields: {
        ...shared,
        id: "ID Платіжного шлюзу Мерчанта",
        payment_gateway_id: "Платіжний шлюз",
        default: "За замовчуванням",
      },
    },

    Chat: {
      name: "Повідомлення",
      fields: {
        ...shared,
        input: {
          placeholder: "Введіть повідомлення",
        },
      },
    },

    File: {
      name: "Файли",
      fields: {
        ...shared,
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
    Merchant: {
      name: "Мерчант",
      fields: {
        ...shared,
        current_password: "Пароль",
        new_password: "Новий пароль",
        storage_capacity: "Об'єм файлового сховища (МБ)",
        design_id: "Дизайн",
        newbie: "Новенький",
      },
      source: {
        status: {
          active: "активний",
          inactive: "неактивний",
          disabled: "деактивований",
          blocked: "заблокований",
          error: "помилка",
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
        password: "Пароль",
        category_id: "Категорія",
        tag_ids: "Теги",
        city: "Місто",
        address: "Адреса",
        entity: "Тип користувача",
        balance: "Баланс",
        unconfirmed_changes: {
          name: "Зміни",
          field_name: "Назва поля",
          value: "Значення",
          status: "Статус",
        },
        transactions: {
          fn_card_owner: "ПІБ власника карти",
          amount: "Кількість",
          sum: "Сума",
          n_accounts_struc: "Тип палива",
          n_service_station: "Заправка",
          address: "Адреса",
          n_issuers: "Платник",
          confirm_status: "Статус",
          session_time: "Дата",
        },
        payment_transactions: {
          client_fn: "ПІБ власника карти",
          s_docums: "Сума",
          payment_note: "Призначення платежу",
          status: "Статус",
          session_time: "Дата",
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
        payment_status: {
          1: "успішно",
        },
        tab: {
          basic: "Базові налаштування",
          confirm_changes: "Підтвердження змін",
        },
        infoTab: {
          info: "Інформація про користувача",
          transactions: "Транзакції",
          payment_transactions: "Поповнення",
        },
        entity: {
          physical: "Фізична особа",
          legal: "Юридична особа",
        },
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
        name: "Назва",
        merchant_id: "Мерчант",
        created_at: "Створено",
        updated_at: "Останні зміни",
      },
    },
    notifications: {
      errors: {
        Forbidden: "Виникла помилка",
        delete_error: "Елемент не може бути видалено!",
        already_exist: "Елемент вже існує",
        name_of_abilities_already_exist: "Можливість вже існує",
        dublicate_name_of_abilities_update:
          "Введено однакові назви можливостей",
        page_set_as_default:
          "Сторінка встановлена в дизайні за замовчуванням, змініть налаштування дизайну, щоб мати можливість видалити цю сторінку",
        oversize: "Файл не може бути більше 10МВ",
        min_length: "Пароль має мати довжину не менше 4-х символів",
        max_length: "Пароль має бути меньше 10 символів",

        not_match: "Пароль невірний",
        password_required: "Пароль є обов'язковим полем",
        invalid_phone_format:
          "Невірний формат телефону, він повинен починатись з 380 та не включати в себе +",
        invalid_email_format: "Некоректний правопис електронної пошти",
        no_free_space:
          "Недостатньо вільного місця, видаліть непотрібні файли перш ніж продовжити",
        forbidden_filetype:
          "Розширення файлу не підтримується, список доступних розширень: .png, .svg, .webp, .pdf",
        invalid_syntax: "Даний синтаксис не підтримується",
        file_in_use:
          "Неможливо видалити файл що в даний момент використовується",
        default_not_found: "Еквайрінг за замовчуванням вже встановлений",
        password_is_required: "Пароль є обов'язковим полем",
        can_not_edit: "Неможливо редагувати з статусом заблоковано",
        can_not_edit_parent:
          "Неможливо редагувати, батьківський елемент блоковано",
        is_not_avilable: "Вибраний елемент не доступний",
      },
      confirm: {
        delete: "Ви впевнені, що хочете видалити цей елемент?",
      },
    },
    Discount: {
      name: "Знижки",
      fields: {
        name: "Назва",
        percent: "Відсоток",
        created_at: "Створено",
        updated_at: "Останні зміни",
      },
    },
  },
};

export default uk;
