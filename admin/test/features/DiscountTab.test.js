import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Discount tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create discount", async () => {
    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Discount/create`),
      2000
    );

    const text1 = (Math.random() + 1).toString(36).substring(10);

    await driver.findElement(By.css("#name")).sendKeys(text1);

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-merchant_id > div > ul > li:nth-child(2)")
        ),
        2000
      )
      .click();

    await driver
      .wait(until.elementLocated(By.id("percent")), 2000)
      .sendKeys("12");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const discountName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const discountMerchant1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    const discountPercent1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-percent.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(discountName1).to.not.be.empty;
    expect(discountMerchant1).to.not.be.empty;
    expect(discountPercent1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);

    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Discount/create`),
      2000
    );

    const text = (Math.random() + 1).toString(36).substring(10);

    await driver.findElement(By.css("#name")).sendKeys(text);

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-merchant_id > div > ul > li:nth-child(1)")
        ),
        2000
      )
      .click();

    await driver
      .wait(until.elementLocated(By.id("percent")), 2000)
      .sendKeys("6");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const discountName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const discountMerchant = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    const discountPercent = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-percent.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(discountName).to.not.be.empty;
    expect(discountMerchant).to.not.be.empty;
    expect(discountPercent).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Sort discounts by name", async () => {
    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Discount?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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
  it("Delete discount", async () => {
    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Видалити']")),
        2000
      )
      .click();
    await driver
      .findElement(By.css("button.MuiButton-text.ra-confirm"))
      .click();
    await driver.sleep(100);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Discount/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("haaa");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-merchant_id > div > ul > li:nth-child(1)")
        ),
        2000
      )
      .click();

    await driver
      .wait(until.elementLocated(By.id("percent")), 2000)
      .sendKeys("12");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const discountName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const discountMerchant1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    const discountPercent1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-percent.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(discountName1).to.not.be.empty;
    expect(discountMerchant1).to.not.be.empty;
    expect(discountPercent1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Discount/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("haaa");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-merchant_id > div > ul > li:nth-child(1)")
        ),
        2000
      )
      .click();
    await driver
      .wait(until.elementLocated(By.id("percent")), 2000)
      .sendKeys("12");

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

  it("Percent value must be less than 100 ", async () => {
    await driver.get(`${Config.serverUrl}/#/Discount`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Discount`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Discount/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("haaa");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css("#menu-merchant_id > div > ul > li:nth-child(1)")
        ),
        2000
      )
      .click();
    await driver
      .wait(until.elementLocated(By.id("percent")), 2000)
      .sendKeys("120");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.sleep(100);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");

    const errorPercent = await driver
      .wait(until.elementLocated(By.id("percent-helper-text")), 2000)
      .getText();

    expect(errorPercent).to.eq("0 - 100");
  });
});
