import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Manager tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create Manager", async () => {
    await driver.get(`${Config.serverUrl}/#/Manager`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Manager/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("company_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("client_id")), 2000).click();
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

    const companyName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-company_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(companyName).to.not.be.empty;

    const clientPhone = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-client_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-company_id")),
      2000
    );
    const initialTableRows = await driver.findElements(
      By.css("td.column-company_id")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Manager/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("company_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[2]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("client_id")), 2000).click();
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

    const companyName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-company_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(companyName1).to.not.be.empty;

    const clientPhone1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-client_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(clientPhone1).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);
    const finalTableRows = await driver.findElements(
      By.css("td.column-company_id")
    );

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Manager`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Manager/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("company_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("client_id")), 2000).click();
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

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Елемент вже існує");
  });

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/Manager`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Manager/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("company_id")), 2000).click();
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

    expect(error).to.eq("Форма недійсна. Перевірте помилки");
  });

  it("Sort managers by name", async () => {
    await driver.get(`${Config.serverUrl}/#/Manager`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Manager`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-company_id > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-company_id > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Manager?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=company_id`
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
