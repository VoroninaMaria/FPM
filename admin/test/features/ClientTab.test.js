import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Client tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Update client info", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.css("#status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='initial']")), 2000)
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
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "666");

    await driver.wait(until.elementLocated(By.id("category_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-category_id > div > ul > li:nth-child(2)")
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
  });

  it("Sort clients name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-phone > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-phone  > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Client?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=phone`
      ),
      2000
    );
    const elements = await driver.findElements(
      By.css(
        "div.MuiPaper-root.MuiPaper-elevation.MuiCard-root.RaList-content > div  > table > tbody > tr.MuiTableRow-root.MuiTableRow-hover.RaDatagrid-selectable"
      )
    );
    const sortedElements = await Promise.all(
      elements.map((element) => element.getText())
    );

    expect(sortedElements).to.be.nested.include.ordered.members(sortedElements);
  });
  it("Create client ", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    const initialTableRows = await driver.findElements(
      By.css("td.column-phone")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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

    const finalTableRows = await driver.findElements(By.css("td.column-phone"));

    await driver.sleep(50);
    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist ", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Елемент вже існує");
  });
  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

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

    expect(error).to.eql("Форма недійсна. Перевірте помилки");
  });
  it("Invalid email", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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

    expect(error).to.eql("Форма недійсна. Перевірте помилки");
    await driver.sleep(40);
    const emailError = await driver
      .wait(until.elementLocated(By.id("email-helper-text")), 2000)
      .getText();

    expect(emailError).to.eql("Хибний email");
  });

  it("Invalid phone number", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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

    expect(error).to.eql("Форма недійсна. Перевірте помилки");

    await driver.sleep(40);
    const emailError = await driver
      .wait(until.elementLocated(By.id("phone-helper-text")), 2000)
      .getText();

    expect(emailError).to.eql("Повинна бути цифра");
  });
  it("Password should have at least 4 symbols ", async () => {
    await driver.get(`${Config.serverUrl}/#/Client`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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

    expect(error).to.eql("Пароль має бути мінімум 4 символи");
  });
});
