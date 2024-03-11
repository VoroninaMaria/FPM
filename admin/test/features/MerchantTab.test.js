import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Merchant tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Sort clients name by ASC", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Merchant?filter=%7B%7D&order=ASC&page=1&perPage=10&sort=name`
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

  it("Add plugins for merchant", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Merchant?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver.wait(until.elementLocated(By.id("tabheader-1")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[2]/label"
          )
        ),
        2000
      )
      .click();
    await driver.sleep(2000);

    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[3]/label"
          )
        ),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[4]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[5]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[6]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[7]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[8]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[10]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[12]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[13]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[14]/label"
          )
        ),
        2000
      )
      .click();
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div[2]/div/form/div/div[2]/div[2]/div[15]/label"
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

    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const merchantLogin = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-login.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;
    expect(merchantLogin).to.not.be.empty;
  });

  it("Update status for Merchant", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
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
    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const merchantLogin = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-login.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const merchantMemoryCapacity = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-storage_capacity.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;
    expect(merchantLogin).to.not.be.empty;
    expect(merchantMemoryCapacity).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
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
    const merchantName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const merchantLogin1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-login.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const merchantMemoryCapacity1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-storage_capacity.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName1).to.not.be.empty;
    expect(merchantLogin1).to.not.be.empty;
    expect(merchantMemoryCapacity1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const statusText1 = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(statusText1).to.eq("активний");
  });

  it("Change memory capacity for Merchant", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.id("storage_capacity")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        "100"
      );

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const merchantLogin = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-login.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const merchantMemoryCapacity = await driver
      .wait(
        until.elementLocated(
          By.css(
            " #main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-storage_capacity.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;
    expect(merchantLogin).to.not.be.empty;
    expect(merchantMemoryCapacity).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const capacityValue = await driver
      .wait(
        until.elementLocated(By.css("td.column-storage_capacity span")),
        2000
      )
      .getText();

    expect(capacityValue).to.eq("100");
  });
  it("Input large capacity value", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.id("storage_capacity")), 2000)
      .sendKeys("10000");

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

    const inputError = await driver
      .wait(until.elementLocated(By.id("storage_capacity-helper-text")), 2000)
      .getText();

    expect(inputError).to.eql("Значення може бути 1000 або менше");
  });

  it("Input invalid capacity value", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.id("storage_capacity")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        "-1"
      );

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

    expect(error).to.eql("Форма недійсна. Перевірте помилки");

    const inputError = await driver
      .wait(until.elementLocated(By.id("storage_capacity-helper-text")), 2000)
      .getText();

    expect(inputError).to.eql("Даний синтаксис не підтримується");
  });
});
