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

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/BrandMerchant/create`),
      2000
    );
    await driver.sleep(100);
    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value='active']")), 2000)
      .click();

    await driver.wait(until.elementLocated(By.id("brand_id")), 2000).click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='Monobrand']")), 2000)
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

    expect(error).to.eql("Елемент вже існує");
  });

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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-brand_id.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName).to.not.be.empty;
    const integrationID = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-id.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationID).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
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
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-brand_id.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationName1).to.not.be.empty;
    const integrationID1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-id.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(integrationID1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-status")), 2000);

    const changeStatusText = await driver
      .wait(until.elementLocated(By.css("td.column-status span")), 2000)
      .getText();

    expect(changeStatusText).to.eq("активний");
  });

  it("Sort Integration name by DESC", async () => {
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

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/BrandMerchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/BrandMerchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/BrandMerchant/create`),
      2000
    );
    await driver.wait(until.elementLocated(By.id("brand_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-brand_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
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
    await driver.sleep(50);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Форма недійсна. Перевірте помилки");
  });
});
