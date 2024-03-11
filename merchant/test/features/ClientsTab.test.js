import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin, checkTexts } from "../shared.js";
import Config from "../Config.js";

describe("Clients tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Find client by phone number", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.findElement(By.name("phone")).sendKeys("380630000001");
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?displayedFilters=%7B%7D&filter=%7B%22phone%22%3A%22380630000001%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    await driver.sleep(30);

    return checkTexts(driver, "td.column-phone > span ", ["380630000001"]);
  });

  it("Find client using invalid phone number", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .findElement(By.name("phone"))
      .sendKeys("380630000011", Key.RETURN);

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?displayedFilters=%7B%7D&filter=%7B%22phone%22%3A%22380630000011%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    const noResultFoundNotification = await driver
      .wait(until.elementLocated(By.css("div.MuiCardContent-root")), 2000)
      .getText();

    expect(noResultFoundNotification).to.deep.eql("Результатів не знайдено");
  });

  it("No result by chosen status", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .findElement(By.xpath("/html/body/div[3]/div[3]/ul/li[4]"))
      .click();

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?displayedFilters=%7B%7D&filter=%7B%22status%22%3A%22blocked%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );

    const noResultFoundNotification = await driver
      .wait(until.elementLocated(By.css("div.MuiCardContent-root")), 2000)
      .getText();

    expect(noResultFoundNotification).to.deep.eql("Результатів не знайдено");
  });

  it("Update status for client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='blocked']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2400
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const statusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText).to.eq("заблокований");

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.css("#status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='initial']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const statusText1 = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText1).to.eq("активний");
  });
  it("add and remove filter from clients status", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='confirmed']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?displayedFilters=%7B%7D&filter=%7B%22status%22%3A%22confirmed%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    await driver.sleep(30);
    await checkTexts(driver, "td.column-status", ["підтверджений"]);

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[aria-label^='Очистити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?displayedFilters=%7B%7D&filter=%7B%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );

    return checkTexts(driver, "td.column-status", [
      "активний",
      "підтверджений",
    ]);
  });

  it("Add category for client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("category_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-category_id > div > ul > li:nth-child(3)")
        ),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-category_id")),
      2000
    );

    const categoryText = await driver
      .wait(until.elementLocated(By.css("td.column-category_id span")), 2000)
      .getText();

    expect(categoryText).to.not.eq(null);
  });

  it("Remove category for client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("category_id")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[aria-label^='Очистити']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row > p > span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.equal("Телефон");
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);

    return checkTexts(driver, "td.column-category_id", ["", ""]);
  });

  it("No result found by chosen category", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.id("category_id")), 2000).click();
    await driver
      .findElement(By.css("#menu-category_id > div > ul > li:nth-child(2)"))
      .click();
    const noResultFoundNotification = await driver
      .wait(until.elementLocated(By.css("div.MuiCardContent-root")), 2000)
      .getText();

    expect(noResultFoundNotification).to.deep.eql("Результатів не знайдено");
  });

  it("Add tag for client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("tag_ids")), 2000).click();
    await driver
      .findElement(By.xpath("/html/body/div[3]/div[3]/ul/li[1]"))
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-tag_ids > div.MuiBackdrop-root.MuiBackdrop-invisible.MuiModal-backdrop"
          )
        ),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-tag_ids")), 2000);

    const tagText = await driver
      .wait(until.elementLocated(By.css("td.column-tag_ids span")), 2000)
      .getText();

    expect(tagText).to.not.eq(null);
  });

  it("Remove tag for client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("tag_ids")), 2000).click();
    await driver
      .findElement(By.css("#menu-tag_ids > div > ul > li:nth-child(1)"))
      .click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-tag_ids > div.MuiBackdrop-root.MuiBackdrop-invisible.MuiModal-backdrop"
          )
        ),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-tag_ids")), 2000);

    const tagText = await driver
      .wait(until.elementLocated(By.css("td.column-tag_ids span")), 2000)
      .getText();

    expect(tagText).to.eq("");
  });

  it("Create client", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);

    await driver.wait(until.elementLocated(By.css("th.column-phone")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-phone")
    );
    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("email")), 2000)
      .sendKeys("tratata@gmail.com");

    await driver
      .wait(until.elementLocated(By.id("first_name")), 2000)
      .sendKeys("Misha");

    await driver
      .wait(until.elementLocated(By.id("last_name")), 2000)
      .sendKeys("Zeleniuk");

    await driver
      .wait(until.elementLocated(By.id("password")), 2000)
      .sendKeys("123123");

    await driver
      .wait(until.elementLocated(By.id("phone")), 2000)
      .sendKeys("380630000004");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-phone.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const clientName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-first_name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    const clientLastName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-last_name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    const clientGmail = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-email.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;
    expect(clientName).to.not.be.empty;
    expect(clientLastName).to.not.be.empty;
    expect(clientGmail).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(50);
    await driver.wait(until.elementLocated(By.css("th.column-phone")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-phone"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
  it("Client already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("email")), 2000)
      .sendKeys("tratata@gmail.com");

    await driver
      .wait(until.elementLocated(By.id("first_name")), 2000)
      .sendKeys("Misha");

    await driver
      .wait(until.elementLocated(By.id("last_name")), 2000)
      .sendKeys("Zeleniuk");

    await driver
      .wait(until.elementLocated(By.id("password")), 2000)
      .sendKeys("123123");

    await driver
      .wait(until.elementLocated(By.id("phone")), 2000)
      .sendKeys("380630000004");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(50);

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Елемент вже існує");
  });

  it("Invalid phone number", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("email")), 2000)
      .sendKeys("lol@gmail.com");
    await driver
      .wait(until.elementLocated(By.id("first_name")), 2000)
      .sendKeys("Kli");
    await driver
      .wait(until.elementLocated(By.id("last_name")), 2000)
      .sendKeys("Kraiderprince");
    await driver
      .wait(until.elementLocated(By.id("phone")), 2000)
      .sendKeys("380637900ju(");

    await driver
      .wait(until.elementLocated(By.id("password")), 2000)
      .sendKeys("123123");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(40);

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");

    const helperTextError = await driver
      .wait(until.elementLocated(By.id("phone-helper-text")), 2000)
      .getText();

    expect(helperTextError).to.eq("Повинна бути цифра");
  });

  it("Invalid email", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("email")), 2000)
      .sendKeys("lol");
    await driver
      .wait(until.elementLocated(By.id("first_name")), 2000)
      .sendKeys("Kli");
    await driver
      .wait(until.elementLocated(By.id("last_name")), 2000)
      .sendKeys("Kraiderprince");
    await driver
      .wait(until.elementLocated(By.id("phone")), 2000)
      .sendKeys("380637900000");

    await driver
      .wait(until.elementLocated(By.id("password")), 2000)
      .sendKeys("123123");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(40);

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");

    const helperTextError = await driver
      .wait(until.elementLocated(By.id("email-helper-text")), 2000)
      .getText();

    expect(helperTextError).to.eq("Хибний email");
  });

  it("Password should have at least 4 symbols ", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("email")), 2000)
      .sendKeys("lol@gmail.com");

    await driver
      .wait(until.elementLocated(By.id("phone")), 2000)
      .sendKeys("380637900000");

    await driver
      .wait(until.elementLocated(By.id("password")), 2000)
      .sendKeys("123");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(40);

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Пароль має мати довжину не менше 4-х символів");
  });
});
