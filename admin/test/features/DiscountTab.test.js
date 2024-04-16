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
    await driver.get(`${Config.serverUrl}/#/Tag`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div > span > div > div.MuiTablePagination-input"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(until.elementLocated(By.css("li[data-value='50']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag/create`), 2000);

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
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const tagName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();
    const tagMerchant = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(tagName).to.not.be.empty;
    expect(tagMerchant).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Tag`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
});
