import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Gas brand tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create Gas brand", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrand/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Jojo");

    await driver
      .wait(until.elementLocated(By.id("logo_file_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("/html/body/div[3]/div/ul/li")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const gasBrandName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName).to.not.be.empty;

    const logo = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span:nth-child(2) > span"
          )
        ),
        2000
      )
      .getText();

    expect(logo).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
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
      until.urlIs(`${Config.serverUrl}/#/GasBrand/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Shell");

    await driver
      .wait(until.elementLocated(By.id("logo_file_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("/html/body/div[3]/div/ul/li")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const gasBrandName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName1).to.not.be.empty;

    const logo1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span:nth-child(2) > span"
          )
        ),
        2000
      )
      .getText();

    expect(logo1).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrand/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Jojo");

    await driver
      .wait(until.elementLocated(By.id("logo_file_id")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.xpath("/html/body/div[3]/div/ul/li")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value^='active']")), 2000)
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

  it("Sort gas brand by name", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/GasBrand?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrand/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("J");
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

  it("Update status for GasBrand", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
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

    const gasBrandName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName).to.not.be.empty;

    const logo = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span:nth-child(2) > span"
          )
        ),
        2000
      )
      .getText();

    expect(logo).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
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
    const gasBrandName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName1).to.not.be.empty;

    const logo1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span:nth-child(2) > span"
          )
        ),
        2000
      )
      .getText();

    expect(logo1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/GasBrand`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/GasBrand`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const changeStatusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(changeStatusText).to.eq("активний");
  });
});
