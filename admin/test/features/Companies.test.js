import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Company tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Sort Company by names", async () => {
    await driver.get(`${Config.serverUrl}/#/Company`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Company`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Company?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
      ),
      2000
    );

    const elements = await driver.findElements(
      By.css(
        "#main-content > div > div > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiCard-root.RaList-content.css-bhp9pd-MuiPaper-root-MuiCard-root > div > div > table > thead > tr > th.MuiTableCell-root.MuiTableCell-head.MuiTableCell-sizeSmall.RaDatagrid-headerCell.column-name > span > span"
      )
    );
    const sortedElements = await Promise.all(
      elements.map((element) => element.getText())
    );

    expect(sortedElements).to.be.nested.include.ordered.members(sortedElements);
  });

  it("Show Company info", async () => {
    await driver.get(`${Config.serverUrl}/#/Company`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Company`), 2000);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перегляд']")), 2000)
      .click();

    const companyName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(companyName).to.not.be.empty;
    const merchant = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchant).to.not.be.empty;
  });
});
