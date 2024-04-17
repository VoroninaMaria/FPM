import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin, checkTexts } from "../shared.js";
import Config from "../Config.js";
import path from "path";

describe("File tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create file", async () => {
    const photoPath = path.resolve("./test/features/images/test.webp");

    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bibi");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='gym1']")), 2000)
      .click();
    const fileInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@id='attachments']")),
      2000
    );

    await fileInput.sendKeys(photoPath);

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const fileName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const fileType = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-mimetype.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(fileName).to.not.be.empty;
    expect(fileType).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);

    await driver.sleep(70);

    const initialTableRows = await driver.findElements(
      By.css("th.column-name")
    );
    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("habibi");
    await driver.wait(until.elementLocated(By.id("merchant_id")), 2000).click();
    await driver
      .wait(until.elementLocated(By.xpath("//*[text()='gym1']")), 2000)
      .click();
    const fileInput1 = await driver.wait(
      until.elementLocated(By.xpath("//input[@id='attachments']")),
      2000
    );

    await fileInput1.sendKeys(photoPath);

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const fileName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row> span"
          )
        ),
        2000
      )
      .getText();
    const fileType1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-mimetype.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(fileName1).to.not.be.empty;
    expect(fileType1).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver.sleep(50);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Find file by name", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver
      .wait(until.elementLocated(By.name("name")), 2000)
      .sendKeys("habibi");
    await driver.sleep(200);
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/File?displayedFilters=%7B%7D&filter=%7B%22name%22%3A%22habibi%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    await driver.sleep(60);
    return checkTexts(driver, "td.column-name > span ", ["habibi"]);
  });

  it("Find file by name that doesn't exist", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver
      .wait(until.elementLocated(By.name("name")), 2000)
      .sendKeys("dhfikfeuifieufkjuiesfw");

    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/File?displayedFilters=%7B%7D&filter=%7B%22name%22%3A%22dhfikfeuifieufkjuiesfw%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    const noResultFoundNotification = await driver
      .wait(until.elementLocated(By.css("div.MuiCardContent-root")), 2000)
      .getText();

    expect(noResultFoundNotification).to.deep.eql("Результатів не знайдено");
  });

  it("Sort files name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/File?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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

  it("Delete file", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);

    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(70);
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

    await driver.sleep(80);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(70);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });

  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Jojo");
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
