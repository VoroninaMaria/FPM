import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Page tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create page", async () => {
    const text = (Math.random() + 1).toString(36).substring(10);

    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bbibi");

    await driver.wait(until.elementLocated(By.id("design_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-design_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
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
    const pageName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-name> span"
          )
        ),
        2000
      )
      .getText();

    expect(pageName).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.sleep(70);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(50);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page/create`), 2000);

    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys(text);

    // select design
    await driver.wait(until.elementLocated(By.id("design_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-design_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();

    // background color
    await driver
      .wait(until.elementLocated(By.name("styles.backgroundColor")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE
      );

    await driver
      .wait(until.elementLocated(By.name("styles.backgroundColor")), 2000)
      .sendKeys("5adfd8");

    // screen click
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div/div/form/div[1]"
          )
        ),
        2000
      )
      .click();

    // vertical alignment
    await driver
      .wait(until.elementLocated(By.id("styles.alignItems")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='flex-start']")), 2000)
      .click();

    // horizontal alignment
    await driver
      .wait(until.elementLocated(By.id("styles.justifyContent")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='flex-start']")), 2000)
      .click();

    // font color
    await driver
      .wait(until.elementLocated(By.name("styles.color")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE
      );

    await driver
      .wait(until.elementLocated(By.name("styles.color")), 2000)
      .sendKeys("bf9af5");

    // screen click
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div/div/form/div[1]"
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
    const pageName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-name> span"
          )
        ),
        2000
      )
      .getText();

    expect(pageName1).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.sleep(50);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bbibi");

    await driver.wait(until.elementLocated(By.id("design_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-design_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
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

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Елемент вже існує");
  });

  it("Change page", async () => {
    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const nameInput = await driver.findElement(By.css("input#name"));

    expect(nameInput).to.not.be.empty;

    const text = (Math.random() + 1).toString(36).substring(10);

    await nameInput.sendKeys(text);
    // vertical alignment
    await driver
      .wait(until.elementLocated(By.id("styles.alignItems")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='flex-end']")), 2000)
      .click();

    // horizontal alignment
    await driver
      .wait(until.elementLocated(By.id("styles.justifyContent")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='flex-end']")), 2000)
      .click();

    // font color
    await driver
      .wait(until.elementLocated(By.name("styles.color")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        "825959"
      );

    // screen click
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "/html/body/div[1]/div/div/div/div/main/div[2]/div/div/div/form/div[1]"
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
    const pageName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-name> span"
          )
        ),
        2000
      )
      .getText();

    expect(pageName).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const pageText = await driver
      .findElement(By.css("td.column-name span"))
      .getText();

    expect(pageText).to.not.be.empty;
  });

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page/create`), 2000);

    // await driver
    //   .wait(until.elementLocated(By.id("name")), 2000)
    //   .sendKeys("bibi");
    await driver.wait(until.elementLocated(By.id("design_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-design_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
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

    const error = await driver
      .wait(until.elementLocated(By.css("#name-helper-text")), 2000)
      .getText();

    expect(error).to.eql("Обов'язково для заповнення");
  });

  it("Sort pages name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Page?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Delete page", async () => {
    await driver.get(`${Config.serverUrl}/#/Page`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Видалити']")),
        2000
      )
      .click();
    await driver
      .findElement(By.css("button.MuiButton-text.ra-confirm"))
      .click();
    await driver.sleep(60);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Page`), 2000);

    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });
});
