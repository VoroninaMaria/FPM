import { expect } from "chai";
import { By, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Membership tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create membership", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );

    const text1 = (Math.random() + 1).toString(36).substring(10);

    await driver.findElement(By.css("#name")).sendKeys(text1);
    await driver
      .wait(until.elementLocated(By.id("price")), 2000)
      .sendKeys("5000");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const membershipName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const membershipTerm = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-term.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();
    const membershipLocation = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-location_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    const membershipFile = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-file_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(membershipName).to.not.be.empty;
    expect(membershipTerm).to.not.be.empty;
    expect(membershipLocation).to.not.be.empty;
    expect(membershipFile).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);

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
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );

    const text = (Math.random() + 1).toString(36).substring(10);

    await driver.findElement(By.css("#name")).sendKeys(text);

    await driver
      .wait(until.elementLocated(By.name("price")), 2000)
      .sendKeys("5000");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const membershipName1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const membershipTerm1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-term.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();
    const membershipLocation1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-location_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    const membershipFile1 = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-file_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(membershipName1).to.not.be.empty;
    expect(membershipTerm1).to.not.be.empty;
    expect(membershipLocation1).to.not.be.empty;
    expect(membershipFile1).to.not.be.empty;

    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(30);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Sort membership by price", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-price > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-price > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Membership?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=price`
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

  it("Delete membership", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-price")), 2000);

    const initialTableRows = await driver.findElements(
      By.css("td.column-price")
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
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.wait(until.elementLocated(By.css("th.column-price")), 2000);

    const finalTableRows = await driver.findElements(By.css("td.column-price"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });

  it("Element already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Voda");

    await driver
      .wait(until.elementLocated(By.id("price")), 2000)
      .sendKeys("5000");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    const membershipName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    const membershipTerm = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-term.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();
    const membershipLocation = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-location_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    const membershipFile = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-file_id.RaSimpleShowLayout-row"
          )
        ),
        2000
      )
      .getText();

    expect(membershipName).to.not.be.empty;
    expect(membershipTerm).to.not.be.empty;
    expect(membershipLocation).to.not.be.empty;
    expect(membershipFile).to.not.be.empty;
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Voda");
    await driver
      .wait(until.elementLocated(By.id("price")), 2000)
      .sendKeys("5000");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
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

    expect(error).to.eq("Елемент вже існує");
  });

  it("Price can't be less than 0 ", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Voda");

    await driver
      .wait(until.elementLocated(By.id("price")), 2000)
      .sendKeys("-1");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.sleep(100);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");

    const errorPercent = await driver
      .wait(until.elementLocated(By.id("price-helper-text")), 2000)
      .getText();

    expect(errorPercent).to.eq("0 - 100000");
  });
  it("Term can't be less than 0 ", async () => {
    await driver.get(`${Config.serverUrl}/#/Membership`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Membership`), 2000);
    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/Membership/create`),
      2000
    );
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Voda");

    await driver
      .wait(until.elementLocated(By.id("price")), 2000)
      .sendKeys("1300");

    await driver
      .wait(until.elementLocated(By.id("term")), 2000)
      .sendKeys("-120");

    await driver.wait(until.elementLocated(By.id("status")), 2000).click();
    await driver
      .wait(until.elementLocated(By.css("[data-value = 'active']")), 2000)
      .click();

    await driver.sleep(20);
    await driver.wait(until.elementLocated(By.id("location_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li[1]")),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("file_id")), 2000).click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.sleep(100);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eq("Форма недійсна. Перевірте помилки");

    const errorPercent = await driver
      .wait(until.elementLocated(By.id("term-helper-text")), 2000)
      .getText();

    expect(errorPercent).to.eq("0 - 365");
  });
});
