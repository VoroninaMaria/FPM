import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("PaymentGateway tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create payment gateway", async () => {
    await driver.get(`${Config.serverUrl}/#/PaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway/create`),
      2000
    );

    await driver.wait(until.elementLocated(By.id("name")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='Pumb']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentGatewayName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const paymentStatus = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentGatewayName).to.not.be.empty;
    expect(paymentStatus).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("name")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='Monobank']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentGatewayName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const paymentStatus1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentGatewayName1).to.not.be.empty;
    expect(paymentStatus1).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    await driver.sleep(50);

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Change payment gateway status", async () => {
    await driver.get(`${Config.serverUrl}/#/PaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='disabled']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentGatewayName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const paymentStatus = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentGatewayName).to.not.be.empty;
    expect(paymentStatus).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentGatewayName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const paymentStatus1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentGatewayName1).to.not.be.empty;
    expect(paymentStatus1).to.not.be.empty;
  });
  it("Payment gateway already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/PaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway/create`),
      2000
    );

    await driver.wait(until.elementLocated(By.id("name")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='Pumb']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Елемент вже існує");
  });

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/PaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway/create`),
      2000
    );

    await driver.wait(until.elementLocated(By.id("name")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value^='Pumb']")), 2000)
      .click();

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

    expect(error).to.eq("Форма недійсна. Перевірте помилки");
  });
  it("Sort PaymentGateway by name", async () => {
    await driver.get(`${Config.serverUrl}/#/PaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/PaymentGateway`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/PaymentGateway?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
      ),
      2000
    );

    const elements = await driver.findElements(
      By.css(
        "#main-content > div.MuiCard-root.RaList-contentdiv > table > tbody > tr.MuiTableRow-root.MuiTableRow-hover.RaDatagrid-row"
      )
    );
    const sortedElements = await Promise.all(
      elements.map((element) => element.getText())
    );

    expect(sortedElements).to.be.nested.include.ordered.members(sortedElements);
  });
});
