import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin, checkTexts } from "../shared.js";
import Config from "../Config.js";
import path from "path";
const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

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
    const photoPath = path.resolve("./test/features/images/unicorn.webp");
    const newName = generateRandomString();

    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 3000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys(newName);

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
    await driver.sleep(50);

    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    await driver.sleep(50);
    const initialTableLength = initialTableRows.length;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);

    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("tyuky");

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
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2500);
    await driver.sleep(50);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    await driver.sleep(60);

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Find file by name", async () => {
    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    const photoPath = path.resolve("./test/features/images/unicorn.webp");

    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("bibibi");

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
    await driver
      .wait(until.elementLocated(By.name("name")), 2000)
      .sendKeys("bibibi");
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/File?displayedFilters=%7B%7D&filter=%7B%22name%22%3A%22bibibi%22%7D&order=ASC&page=1&perPage=10&sort=id`
      ),
      2000
    );
    await driver.sleep(30);

    return checkTexts(driver, "td.column-name > span ", ["bibibi"]);
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
      2500
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

    await driver.sleep(100);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    await driver.sleep(30);
    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });

  it("Element already exist", async () => {
    const photoPath = path.resolve("./test/features/images/unicorn.webp");

    await driver.get(`${Config.serverUrl}/#/File`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2500);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2500)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2500);

    await driver
      .wait(until.elementLocated(By.id("name")), 2500)
      .sendKeys("hag");

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

    await driver
      .wait(until.elementLocated(By.css("[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File`), 2000);
    await driver.sleep(100);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/File/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("hag");

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

    const error = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#root > div > div.MuiSnackbar-root.MuiSnackbar-anchorOriginBottomCenter > div > div"
          )
        ),
        2800
      )
      .getText();

    expect(error).to.eq("Елемент вже існує");
  });
});
