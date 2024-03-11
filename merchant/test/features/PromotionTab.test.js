import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

describe("Promotion tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create promotion", async () => {
    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);
    const newPromotionName = generateRandomString();

    await driver.sleep(70);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Promotion/create`),
      2000
    );

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();

    await driver
      .wait(until.elementLocated(By.xpath("/html/body/div[3]/div/ul/li")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("title")), 2000)
      .sendKeys(newPromotionName);
    await driver
      .wait(until.elementLocated(By.id("text")), 2000)
      .sendKeys("Hello there!!!!!!!!!!");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const promotionName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-title.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const promotionText = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-text.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(promotionName).to.not.be.empty;
    expect(promotionText).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-title")), 2000);
    const initialTableRows = await driver.findElements(
      By.css("td.column-title")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Promotion/create`),
      2000
    );

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(until.elementLocated(By.xpath("/html/body/div[3]/div/ul/li")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("title")), 2000)
      .sendKeys(newPromotionName);

    await driver
      .wait(until.elementLocated(By.id("text")), 2000)
      .sendKeys("Hello there!!!!!!!!!!");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const promotionName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-title.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const promotionText1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-text.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(promotionName1).to.not.be.empty;
    expect(promotionText1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-title")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-title"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
  it("Sort promotion titles by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-title > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-title > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Promotion?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=title`
      ),
      2500
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

  it("Create promotion with empty fields", async () => {
    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Promotion/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("text")), 2000)
      .sendKeys("Hello there!!!!!!!!!!");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const error = await driver
      .wait(until.elementLocated(By.css("#title-helper-text")), 2000)
      .getText();

    expect(error).to.eql("Обов'язково для заповнення");
  });
  it("Delete file", async () => {
    await driver.get(`${Config.serverUrl}/#/Promotion`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Promotion`), 2000);

    await driver.wait(until.elementLocated(By.css("th.column-title")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-title")
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
    await driver.wait(until.elementLocated(By.css("th.column-title")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-title"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });
});
