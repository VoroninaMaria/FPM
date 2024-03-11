import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Integration merchant tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Update status for Integration", async () => {
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-brand_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName).to.not.be.empty;

    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-brand_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName1).to.not.be.empty;

    const merchantName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const changeStatusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(changeStatusText).to.eq("активний");
  });

  it("Sort merchant integration name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-brand_id > span")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("th.column-brand_id > span")), 2000)
      .click();

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/BrandMerchant?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=brand_id`
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

  it("Create merchant integration", async () => {
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    // pagination
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div/span/div/div[2]/div"
          )
        ),
        2000
      )
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='50']")), 2000)
      .click();

    driver.wait(until.elementLocated(By.css("th.column-brand_id")), 2000);
    await driver.sleep(50);
    const initialTableRows = await driver.findElements(
      By.css("td.column-brand_id")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/BrandMerchant/create`),
      2000
    );

    await driver.findElement(By.id("merchant_id")).click();
    await driver.findElement(By.xpath("//*[text()='bolt']")).click();

    await driver.findElement(By.id("status")).click();
    await driver.findElement(By.css("[data-value='active']")).click();

    await driver.findElement(By.id("brand_id")).click();
    await driver
      .findElement(By.css("#menu-brand_id > div > ul > li:nth-child(2)"))
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-brand_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName).to.not.be.empty;

    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-brand_id")), 2000);
    await driver.sleep(40);
    const finalTableRows = await driver.findElements(
      By.css("td.column-brand_id")
    );

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });
});
