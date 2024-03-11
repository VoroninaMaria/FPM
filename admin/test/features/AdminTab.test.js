import { expect } from "chai";
import { By, until, Key } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Admin tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("Change admin current password", async () => {
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Admin`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.findElement(By.css("#current_password")).sendKeys("123123");

    await driver.findElement(By.css("#new_password")).sendKeys("1231231");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const loginPage = await driver.wait(
      until.urlIs(`${Config.serverUrl}/#/login`),
      2000
    );

    expect(loginPage).to.be.true;

    const username = await driver.findElement(By.css("#username"));
    const usernameValue = await username.getAttribute("value");

    expect(usernameValue).to.equal("");
    await username.sendKeys("offtop");

    const userpassword = await driver.findElement(By.css("#password"));
    const passwordValue = await userpassword.getAttribute("value");

    expect(passwordValue).to.equal("");
    await userpassword.sendKeys("1231231", Key.RETURN);

    const adminName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-login.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(adminName).to.not.be.empty;

    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.findElement(By.css("#current_password")).sendKeys("1231231");

    await driver.findElement(By.css("#new_password")).sendKeys("123123");

    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    await driver.wait(until.urlIs(`${Config.serverUrl}/#/login`), 2000);

    expect(loginPage).to.be.true;
  });

  it("Invalid form", async () => {
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Admin`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.findElement(By.css("#current_password")).sendKeys("123123");

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

  it("Password should be at least 4 characters", async () => {
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Admin`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    await driver.findElement(By.css("#current_password")).sendKeys("123");
    await driver.findElement(By.css("#new_password")).sendKeys("123");

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

    expect(error).to.eql("Пароль має бути мінімум 4 символи");
  });
});
