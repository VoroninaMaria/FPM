import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

describe("Category tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Sort category by name", async () => {
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Category?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Change category name", async () => {
    await driver.get(`${Config.serverUrl}/#/Category`);

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    const text1 = (Math.random() + 1).toString(36).substring(10);
    const nameInput = await driver.findElement(By.css("input#name"));

    await nameInput.sendKeys(text1);
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const categoryName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(categoryName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.sleep(100);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const categoryText = await driver
      .findElement(By.css("td.column-name span"))
      .getText();

    expect(categoryText).to.not.be.empty;
  });

  it("Create category", async () => {
    const newCategoryName = generateRandomString();

    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Category/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.css("#name")), 2000)
      .sendKeys(newCategoryName);

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const categoryName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(categoryName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Delete category", async () => {
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
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

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(1000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });
  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Category/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("ha");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const categoryName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(categoryName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Category`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Category`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Category/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("ha");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(60);
    const errorInput = await driver
      .wait(
        until.elementLocated(By.css(".MuiFormHelperText-root.Mui-error")),
        2000
      )
      .getText();

    expect(errorInput).to.eq("Елемент вже існує");
  });
});
