import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Gas brand merchant tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create Gas brand merchant", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrandMerchant`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("gas_brand_id")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-gas_brand_id.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName).to.not.be.empty;

    const status = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(status).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );
    await driver.wait(
      until.elementLocated(By.css("th.column-gas_brand_id")),
      2000
    );
    const initialTableRows = await driver.findElements(
      By.css("td.column-gas_brand_id")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant/create`),
      2000
    );

    await driver
      .wait(until.elementLocated(By.id("gas_brand_id")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[2]")),
        2000
      )
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-gas_brand_id.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName1).to.not.be.empty;

    const status1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(status1).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );
    const finalTableRows = await driver.findElements(
      By.css("td.column-gas_brand_id")
    );

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrandMerchant`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("gas_brand_id")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
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
    await driver.get(`${Config.serverUrl}/#/GasBrandMerchant`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.css("th.column-gas_brand_id > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-gas_brand_id > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/GasBrandMerchant?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=gas_brand_id`
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
    await driver.get(`${Config.serverUrl}/#/GasBrandMerchant`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant/create`),
      2000
    );

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
    await driver.sleep(40);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");
  });

  it("Add fuel for GasBrandMerchant", async () => {
    await driver.get(`${Config.serverUrl}/#/GasBrandMerchant`);
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/GasBrandMerchant`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("button[aria-label='Додати']")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.id("fuels.0.name")), 2000)
      .sendKeys("lolo");

    await driver
      .wait(until.elementLocated(By.id("fuels.0.regular_price")), 2000)
      .sendKeys("234452");
    await driver
      .wait(until.elementLocated(By.id("fuels.0.discount_price")), 2000)
      .sendKeys("2342");

    await driver
      .wait(until.elementLocated(By.id("fuels.0.status")), 2000)
      .click();

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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-gas_brand_id.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(gasBrandName).to.not.be.empty;

    const status = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-status.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(status).to.not.be.empty;

    const fuelName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-fuels.RaSimpleShowLayout-row > div > div.RaDatagrid-tableWrapper > table > tbody > tr > td.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall.column-name.RaDatagrid-rowCell > span"
          )
        ),
        2000
      )
      .getText();

    expect(fuelName).to.not.be.empty;

    const fuelPrice = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-fuels.RaSimpleShowLayout-row > div > div.RaDatagrid-tableWrapper > table > tbody > tr > td.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall.column-regular_price.RaDatagrid-rowCell > span"
          )
        ),
        2000
      )
      .getText();

    expect(fuelPrice).to.not.be.empty;

    const fuelDiscountPrice = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-fuels.RaSimpleShowLayout-row > div > div.RaDatagrid-tableWrapper > table > tbody > tr > td.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall.column-discount_price.RaDatagrid-rowCell > span"
          )
        ),
        2000
      )
      .getText();

    expect(fuelDiscountPrice).to.not.be.empty;

    const fuelStatus = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-fuels.RaSimpleShowLayout-row > div > div.RaDatagrid-tableWrapper > table > tbody > tr > td.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall.column-status.RaDatagrid-rowCell > span"
          )
        ),
        2000
      )
      .getText();

    expect(fuelStatus).to.not.be.empty;
  });
});
