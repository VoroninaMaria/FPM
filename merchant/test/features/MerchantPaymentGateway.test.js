import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

describe("Merchant payment gateway tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create Merchant payment gateway", async () => {
    const newName = generateRandomString();

    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );
    await driver.sleep(80);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='Monobank']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Mono");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName).to.not.be.empty;
    const status = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(status).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    await driver.wait(
      until.elementLocated(By.css("th.column-payment_gateway_id")),
      2000
    );

    const initialTableRows = await driver.findElements(
      By.css("td.column-payment_gateway_id")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(80);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='Pumb']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys(newName);

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const paymentName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName1).to.not.be.empty;
    const status1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(status1).to.not.be.empty;
    const paymentGateway1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-payment_gateway_id.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentGateway1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    const finalTableRows = await driver.findElements(
      By.css("td.column-payment_gateway_id")
    );

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
  it("Sort Merchant payment gatewayby name", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );
    await driver
      .wait(
        until.elementLocated(By.css("th.column-payment_gateway_id > span")),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("th.column-payment_gateway_id > span")),
        2000
      )
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/MerchantPaymentGateway?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=payment_gateway_id`
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

  it("Change merchant payment gateway status and default", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("default")), 2000).click();

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

    const paymentName = await driver
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

    expect(paymentName).to.not.be.empty;
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

    const paymentName1 = await driver
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

    expect(paymentName1).to.not.be.empty;
    expect(paymentStatus1).to.not.be.empty;
  });

  it("Payment gateway already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='Monobank']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Mono");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
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
  it("Change merchant payment gateway default value", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.css("th.column-default > span")), 2000)
      .click();

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/MerchantPaymentGateway?filter=%7B%7D&order=ASC&page=1&perPage=10&sort=default`
      ),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("default")), 2000).click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Еквайрінг за замовчуванням вже встановлений");
  });

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("kiko");

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
});
