import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

const generateRandomString = () =>
  (Math.random() + 1).toString(36).substring(10);

describe("Button block tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Create block with type button", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver.sleep(50);

    const newName1 = generateRandomString();

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys(newName1);

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();

    // block config
    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();
    // click link
    await driver
      .wait(until.elementLocated(By.id("props.redirect_page_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    // text input
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kuku");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    // show info page
    await driver.sleep(100);
    const blockName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-name > span"
          )
        ),
        2500
      )
      .getText();

    const pageName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-page_id> span > a > span"
          )
        ),
        2000
      )
      .getText();

    const blockType = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div.RaTabbedShowLayout-content > div > span.MuiStack-root.ra-field.ra-field-type > span"
          )
        ),
        2000
      )
      .getText();

    expect(blockName).to.not.be.empty;
    expect(pageName).to.not.be.empty;
    expect(blockType).to.equal("Кнопка");
    // change button block

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const nameInput = await driver.findElement(By.css("input#name"));

    expect(nameInput).to.not.be.empty;

    const text = (Math.random() + 1).toString(36).substring(10);

    await nameInput.sendKeys(text);

    // position
    await driver
      .wait(until.elementLocated(By.id("position")), 2000)
      .sendKeys(Key.BACK_SPACE, "3");

    // blocks amount
    await driver
      .wait(until.elementLocated(By.id("blocks")), 2000)
      .sendKeys(Key.BACK_SPACE, "3");

    // block config
    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();

    // click link
    await driver
      .wait(until.elementLocated(By.id("props.redirect_page_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    //  action
    await driver
      .wait(until.elementLocated(By.id("props.action")), 2000)
      .sendKeys("ffffffff");

    // container color

    await driver
      .wait(until.elementLocated(By.name("styles.backgroundColor")), 2000)
      .sendKeys("#ae44d1");

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

    // text alignment
    await driver
      .wait(until.elementLocated(By.id("block_select_page_id")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='start']")), 2000)
      .click();

    // font color

    await driver
      .wait(until.elementLocated(By.name("styles.borderColor")), 2000)
      .sendKeys("#bf9af5");

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

    // font weight
    await driver
      .wait(until.elementLocated(By.id("styles.fontWeight")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "600");

    // font size
    await driver
      .wait(until.elementLocated(By.id("styles.fontSize")), 2000)
      .sendKeys(Key.BACK_SPACE, "9");

    // text style
    await driver
      .wait(until.elementLocated(By.id("styles.fontStyle")), 2000)
      .click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='italic']")), 2000)
      .click();

    // weight
    await driver
      .wait(until.elementLocated(By.id("styles.width")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, "4%");

    // border weight
    await driver
      .wait(until.elementLocated(By.id("styles.borderWidth")), 2000)
      .sendKeys(Key.BACK_SPACE, "4");

    // height
    await driver
      .wait(until.elementLocated(By.id("styles.height")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, "4");
    // border radius
    await driver
      .wait(until.elementLocated(By.id("styles.borderRadius")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, "4");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.sleep(20);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Перелік']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver.sleep(50);

    // const finalTableRows = await driver.findElements(By.css("td.column-name"));

    // expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
  });

  it("Element button already exist", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver.sleep(50);
    const initialTableRows = await driver.findElements(
      By.css("td.column-name")
    );

    const initialTableLength = initialTableRows.length;

    await driver.sleep(100);

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Lili");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();
    // block config
    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();

    // click link
    await driver
      .wait(until.elementLocated(By.id("props.redirect_page_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();
    // text input
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kuku");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver.sleep(40);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength + 1);
    await driver.sleep(20);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);
    await driver
      .wait(until.elementLocated(By.id("name")), 2000)
      .sendKeys("Lili");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();
    // block config
    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();

    // click link
    await driver
      .wait(until.elementLocated(By.id("props.redirect_page_id")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.xpath("/html/body/div[3]/div[3]/ul/li")),
        2000
      )
      .click();

    // text input
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kuku");

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

  it("Sort blocks name by DESC", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver
      .wait(until.elementLocated(By.css("th.column-name > span")), 2000)
      .click();
    await driver.wait(
      until.urlIs(
        `${Config.serverUrl}/#/Block?filter=%7B%7D&order=DESC&page=1&perPage=10&sort=name`
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
  it("Delete block", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
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

    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(40);
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

    await driver.sleep(40);
    await driver.wait(until.elementLocated(By.css("th.column-name")), 2000);
    await driver.sleep(40);
    const finalTableRows = await driver.findElements(By.css("td.column-name"));

    expect(finalTableRows).to.have.lengthOf(initialTableLength - 1);
  });
  it("Invalid form", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);

    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("bi");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();
    await driver.sleep(60);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Форма недійсна. Перевірте помилки");

    const inputError = await driver
      .wait(until.elementLocated(By.id("page_id-helper-text")), 2000)
      .getText();

    expect(inputError).to.be.eq("Обов'язково для заповнення");
  });
  it("Invalid color value", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);

    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("bi");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kiki");

    await driver.wait(until.elementLocated(By.id("tabheader-1")), 2000).click();

    await driver
      .wait(
        until.elementLocated(By.name("container_styles.backgroundColor")),
        2000
      )
      .sendKeys("#bf*67t7=@");
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
    await driver.sleep(40);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Даний синтаксис не підтримується");
  });
  it("Input large value for fields", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);

    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("bi");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kiki");

    // font weight
    await driver
      .wait(until.elementLocated(By.id("styles.fontWeight")), 2000)
      .sendKeys("600");

    // font size
    await driver
      .wait(until.elementLocated(By.id("styles.fontSize")), 2000)
      .sendKeys(Key.BACK_SPACE, "9000");

    // weight
    await driver
      .wait(until.elementLocated(By.id("styles.width")), 2000)
      .sendKeys("499");

    // border weight
    await driver
      .wait(until.elementLocated(By.id("styles.borderWidth")), 2000)
      .sendKeys("004");

    // height
    await driver
      .wait(until.elementLocated(By.id("styles.height")), 2000)
      .sendKeys("004");
    // border radius
    await driver
      .wait(until.elementLocated(By.id("styles.borderRadius")), 2000)
      .sendKeys("400");

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

    const fontweightError = await driver
      .wait(until.elementLocated(By.id("styles.fontWeight-helper-text")), 2000)
      .getText();

    expect(fontweightError).to.eql("Значення може бути 900 або менше");

    const fontSizeError = await driver
      .wait(until.elementLocated(By.id("styles.fontSize-helper-text")), 2000)
      .getText();

    expect(fontSizeError).to.eql("Значення може бути 1000 або менше");

    const borderweightError = await driver
      .wait(until.elementLocated(By.id("styles.borderWidth-helper-text")), 2000)
      .getText();

    expect(borderweightError).to.eql("Значення може бути 100 або менше");

    const weightError = await driver
      .wait(until.elementLocated(By.id("styles.width-helper-text")), 2000)
      .getText();

    expect(weightError).to.eql("Значення може бути 100 або менше");

    const heightError = await driver
      .wait(until.elementLocated(By.id("styles.height-helper-text")), 2000)
      .getText();

    expect(heightError).to.eql("Значення може бути 100 або менше");

    const borderRadiusError = await driver
      .wait(
        until.elementLocated(By.id("styles.borderRadius-helper-text")),
        2000
      )
      .getText();

    expect(borderRadiusError).to.eql("Значення може бути 100 або менше");
  });
  it("Input invalid value for fields", async () => {
    await driver.get(`${Config.serverUrl}/#/Block`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Створити']")), 2000)
      .click();
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Block/create`), 2000);

    await driver.wait(until.elementLocated(By.id("name")), 2000).sendKeys("bi");

    await driver.wait(until.elementLocated(By.id("type")), 2000).click();

    await driver
      .wait(until.elementLocated(By.css("[data-value='Button']")), 2000)
      .click();

    // select page
    await driver.wait(until.elementLocated(By.id("page_id")), 2000).click();

    await driver
      .wait(
        until.elementLocated(
          By.css(
            "#menu-page_id > div.MuiPaper-root.MuiMenu-paper.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper > ul > li"
          )
        ),
        2000
      )
      .click();

    await driver.wait(until.elementLocated(By.id("tabheader-2")), 2000).click();
    await driver
      .wait(until.elementLocated(By.id("props.text")), 2000)
      .sendKeys("kiki");

    // font weight
    await driver
      .wait(until.elementLocated(By.id("styles.fontWeight")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-600");

    // font size
    await driver
      .wait(until.elementLocated(By.id("styles.fontSize")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-26");

    // weight
    await driver
      .wait(until.elementLocated(By.id("styles.width")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-100");

    // border weight
    await driver
      .wait(until.elementLocated(By.id("styles.borderWidth")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-100");

    // height
    await driver
      .wait(until.elementLocated(By.id("styles.height")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-100");
    // border radius
    await driver
      .wait(until.elementLocated(By.id("styles.borderRadius")), 2000)
      .sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, "-400");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.sleep(60);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Форма недійсна. Перевірте помилки");

    const fontweightError = await driver
      .wait(until.elementLocated(By.id("styles.fontWeight-helper-text")), 2000)
      .getText();

    expect(fontweightError).to.eql("Мінімальне значення 100");

    const fontSizeError = await driver
      .wait(until.elementLocated(By.id("styles.fontSize-helper-text")), 2000)
      .getText();

    expect(fontSizeError).to.eql("Мінімальне значення 1");

    const borderweightError = await driver
      .wait(until.elementLocated(By.id("styles.borderWidth-helper-text")), 2000)
      .getText();

    expect(borderweightError).to.eql("Мінімальне значення 0");

    const weightError = await driver
      .wait(until.elementLocated(By.id("styles.width-helper-text")), 2000)
      .getText();

    expect(weightError).to.eql("Мінімальне значення 0");

    const heightError = await driver
      .wait(until.elementLocated(By.id("styles.height-helper-text")), 2000)
      .getText();

    expect(heightError).to.eql("Мінімальне значення 0");

    const borderRadiusError = await driver
      .wait(
        until.elementLocated(By.id("styles.borderRadius-helper-text")),
        2000
      )
      .getText();

    expect(borderRadiusError).to.eql("Мінімальне значення 0");
  });
});
