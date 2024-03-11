import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Tags tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );
  afterEach(() => driver.quit());

  it("Sort tags name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Tag`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Tag?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Change tag name", async () => {
    await driver.get(`${Config.serverUrl}/#/Tag`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const nameInput = await driver.findElement(By.css("input#name"));

    expect(nameInput).to.not.be.empty;

    const text = (Math.random() + 1).toString(36).substring(10);

    await nameInput.sendKeys(text);
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

    const tagText = await driver
      .findElement(By.css("td.column-name span"))
      .getText();

    expect(tagText).to.not.be.empty;
  });

  it("Delete tag", async () => {
    await driver.get(`${Config.serverUrl}/#/Tag`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
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

    await driver.sleep(50);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Tag`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });

  it("Create tag", async () => {
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
