import { By, until } from "selenium-webdriver";
import { checkTexts, performLogin, buildDriver } from "../../shared.js";
import Config from "../../Config.js";
import { expect } from "chai";
describe("Client List", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());
  describe("ordering", () => {
    it("default ordering should be by phone ASC", async () => {
      await driver.get(`${Config.serverUrl}/#/Client`);
      await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
      checkTexts(driver, "td.column-phone", ["380630000000", "380630000001"]);
    });

    it("click on phone changes ordering", async () => {
      await driver.get(`${Config.serverUrl}/#/Client`);
      await driver.wait(until.urlIs(`${Config.serverUrl}/#/Client`), 2000);
      const sortButton = await driver.wait(
        until.elementLocated(By.css("th.column-phone span")),
        2000
      );

      await sortButton.click();
      await sortButton.click();
      await driver.wait(
        until.urlIs(
          `${Config.serverUrl}/#/Client?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=phone`
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

      expect(sortedElements).to.be.nested.include.ordered.members(
        sortedElements
      );
    });
  });
});
