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

  it("Change status for Sms Service", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.css("#status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='disabled']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    let statusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText).to.eq("деактивований");

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.css("#status")), 2000).click();
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

    statusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText).to.eq("активний");
  });
  it("Create new Sms Service", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-service_name")),
      2000
    );

    const initialTableRows = await driver.findElements(
      By.css("td.column-service_name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/SmsService/create`),
      2000
    );
    await driver.findElement(By.css("#service_name")).click();
    await driver
      .findElement(By.css("#menu-service_name > div > ul > li:nth-child(1)"))
      .click();

    await driver.findElement(By.id("config.key")).sendKeys("jojo");
    await driver.findElement(By.id("config.sender")).sendKeys("zalypa");
    await driver.findElement(By.id("status")).click();
    await driver
      .findElement(By.css("#menu-status > div > ul > li:nth-child(1)"))
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-service_name")),
      2000
    );

    const finalTableRows = await driver.findElements(
      By.css("td.column-service_name")
    );
    const finalTableLength = finalTableRows.length;

    expect(finalTableLength).to.equal(initialTableLength + 1);
  });
  it("Sort Integration name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-service_name> span")), 2000)
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

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/SmsService`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/SmsService`), 2000);
    await driver.wait(
      until.elementLocated(By.css("th.column-service_name")),
      2000
    );
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/SmsService/create`),
      2000
    );
    await driver.findElement(By.css("#service_name")).click();
    await driver
      .findElement(By.css("#menu-service_name > div > ul > li:nth-child(1)"))
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

    expect(error).to.eql("Форма недійсна. Перевірте помилки");
  });
});
