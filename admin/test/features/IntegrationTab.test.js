import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Integration tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Update status for Integration", async () => {
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='disabled']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const integrationName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const statusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText).to.eq("деактивований");

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='active']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const integrationName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const changeStatusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(changeStatusText).to.eq("активний");
  });

  it("Create Integration", async () => {
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand/create`), 2000);
    await driver.sleep(100);

    await driver.findElement(By.id("name")).click();
    await driver.findElement(By.css("[data-value='Datex']")).click();

    await driver.findElement(By.id("status")).click();
    await driver.findElement(By.css("[data-value='active']")).click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const integrationName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Sort Integration name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Brand?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Integration already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Brand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Brand/create`), 2000);
    await driver.sleep(100);

    await driver.findElement(By.id("name")).click();
    await driver.findElement(By.css("[data-value='Monobrand']")).click();

    await driver.findElement(By.id("status")).click();
    await driver.findElement(By.css("[data-value='active']")).click();

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
});
