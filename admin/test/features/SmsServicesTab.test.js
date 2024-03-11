import { expect } from "chai";

import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("SmsService tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Sort SmsServices name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-service_name > span")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("th.column-service_name> span")), 2000)
      .click();

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/SmsService?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=service_name`
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

  it("Update status for SmsService", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='blocked']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const statusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText).to.eq("заблокований");

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

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const changeStatusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(changeStatusText).to.eq("активний");
  });

  it("Create SmsService", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-service_name ")),
      2000
    );

    const initialTableRows = await driver.findElements(
      By.css("td.column-service_name ")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(40);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/SmsService/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("service_name")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='alphaSms']")), 2000)
      .click();

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
      .wait(until.elementLocated(By.id("config.key")), 2000)
      .sendKeys("shosho");
    await driver
      .wait(until.elementLocated(By.id("config.sender")), 2000)
      .sendKeys("Sho");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='blocked']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-service_name ")),
      2000
    );

    const finalTableRows = await driver.findElements(
      By.css("td.column-service_name ")
    );

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/SmsService/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("service_name")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='alphaSms']")), 2000)
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

    expect(error).to.be.eq("Форма недійсна. Перевірте помилки");
    const inputError = await driver
      .wait(until.elementLocated(By.id("config.key-helper-text")), 2000)
      .getText();

    expect(inputError).to.be.eq("Обов'язково для заповнення");
  });
});
