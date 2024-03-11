import { expect } from "chai";
import { By, Key, until } from "selenium-webdriver";
import { buildDriver, performLogin } from "../shared.js";
import Config from "../Config.js";

describe("Merchant tab tests", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );
  afterEach(() => driver.quit());

  it("Change merchant current password", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);

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
    await username.sendKeys("uklon");

    const userpassword = await driver.findElement(By.css("#password"));
    const passwordValue = await userpassword.getAttribute("value");

    expect(passwordValue).to.equal("");
    userpassword.sendKeys("1231231", Key.RETURN);
    const merchantName = await driver
      .wait(
        until.elementLocated(
          By.css(
            "#main-content > div > div.RaShow-main > div > div > div > span.MuiStack-root.ra-field.ra-field-name.RaSimpleShowLayout-row > span"
          )
        ),
        2000
      )
      .getText();

    expect(merchantName).to.not.be.empty;
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
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

  it("Input invalid merchant current password", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const currentPasswordInput = await driver.findElement(
      By.css("#current_password")
    );

    const currentPasswordInputValue = await currentPasswordInput.getAttribute(
      "value"
    );

    expect(currentPasswordInputValue).to.equal("");

    await currentPasswordInput.sendKeys("1231231");

    const newPasswordInput = await driver.findElement(By.css("#new_password"));

    const newPasswordInputInputValue = await newPasswordInput.getAttribute(
      "value"
    );

    expect(newPasswordInputInputValue).to.equal("");

    await newPasswordInput.sendKeys("123123");
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("current_password_doesnt_match" && "Пароль невірний");
  });

  it("Checking if New password field is required", async () => {
    await driver.get(`${Config.serverUrl}/#/Merchant`);
    await driver.wait(until.urlIs(`${Config.serverUrl}/#/Merchant`), 2000);
    await driver
      .wait(until.elementLocated(By.css("a[aria-label^='Редагувати']")), 2000)
      .click();

    const currentPasswordInput = await driver.findElement(
      By.css("#current_password")
    );
    const currentPasswordInputValue = await currentPasswordInput.getAttribute(
      "value"
    );

    expect(currentPasswordInputValue).to.equal("");

    await currentPasswordInput.sendKeys("123123");
    await driver
      .wait(
        until.elementLocated(By.css("button[aria-label^='Зберегти']")),
        2000
      )
      .click();

    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Пароль є обов'язковим полем");
  });
});
