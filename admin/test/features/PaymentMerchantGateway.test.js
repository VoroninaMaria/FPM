import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Merchant Payment Gateway tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create merchant payment gateway", async () => {
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
    await driver.sleep(20);

    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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
    const paymentGateway = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-payment_gateway_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName).to.not.be.empty;
    expect(paymentStatus).to.not.be.empty;
    expect(paymentGateway).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
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
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Jojo");

    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[2]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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
    const paymentGateway1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-payment_gateway_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName1).to.not.be.empty;
    expect(paymentStatus1).to.not.be.empty;
    expect(paymentGateway1).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
      2000
    );

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
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
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div[1]/div/div[1]/label"
          )
        ),
        2000
      )
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
    const paymentGateway = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-payment_gateway_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName).to.not.be.empty;
    expect(paymentStatus).to.not.be.empty;
    expect(paymentGateway).to.not.be.empty;
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
    const paymentGateway1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-payment_gateway_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(paymentName1).to.not.be.empty;
    expect(paymentStatus1).to.not.be.empty;
    expect(paymentGateway1).to.not.be.empty;
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
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("kiko");
    await driver
      .wait(until.elementLocated(By.id("payment_gateway_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
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
  it("Sort MerchantPaymentGateway by name", async () => {
    await driver.get(`${Config.serverUrl}/#/MerchantPaymentGateway`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/MerchantPaymentGateway`),
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
        `${Config.serverUrl}/#/MerchantPaymentGateway?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div[1]/div/div[1]/label"
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

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Еквайрінг за замовчуванням вже обраний");
  });
});
