import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";
const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

describe("Design tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create design", async () => {
    const newName = generateRandomString();

    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys(newName);
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const designName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

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

    expect(designName).to.not.be.empty;
    expect(merchantName).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.sleep(80);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bibi");

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
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
        Key.BACK_SPACE,
        "5adfd8"
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
        "bf9af5"
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

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const designName2 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

    const merchantName2 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-merchant_id.RaSimpleShowLayout-row > span > a > span"
          )
        ),
        2000
      )
      .getText();

    expect(designName2).to.not.be.empty;
    expect(merchantName2).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.sleep(50);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bibi");

    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
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

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design/create`), 2000);

    // await driver
    //   .wait(until.elementLocated(By.id("name")), 2000)
    //   .sendKeys("bibi");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
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

  it("Change design ", async () => {
    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const nameInput = await driver.findElement(By.css("input#name"));

    expect(nameInput).to.not.be.empty;

    const text = (Math.random() + 1).toString(36).substring(10);

    await nameInput.sendKeys(text);
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
        "64eb52"
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

    // background color
    await driver
      .wait(until.elementLocated(By.name("styles.backgroundColor")), 2000)
      .sendKeys(
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        Key.BACK_SPACE,
        "605579"
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

    // vertical alignment
    await driver
      .wait(until.elementLocated(By.id("styles.alignItems")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='flex-start']")), 2000)
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const designName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();

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

    expect(designName).to.not.be.empty;
    expect(merchantName).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const designText = await driver
      .findElement(By.css("td.column-name span"))
      .getText();

    expect(designText).to.not.be.empty;
  });

  it("Sort designs name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Design?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Delete design", async () => {
    await driver.get(`${Config.serverUrl}/#/Design`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
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

    await driver.sleep(70);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Design`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });
});
