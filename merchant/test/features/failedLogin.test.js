import { expect } from "chai";
import { By, Key, WebElement, until } from "selenium-webdriver";
import Config from "../Config.js";
import { buildDriver } from "../shared.js";

describe("Failed Login attempts", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;
    })
  );

  afterEach(() => driver.quit());

  it("should not login successfully with invalid credentials", async () => {
    await driver.get(Config.serverUrl);
    const usernameInput = await driver.findElement(By.id("username"));
    const passwordInput = await driver.findElement(By.id("password"));

    await usernameInput.sendKeys("gym1");
    await passwordInput.sendKeys("1231234", Key.RETURN);

    const errorNotification = await driver.findElement(
      By.css(".MuiSnackbar-root")
    );
    const error = await errorNotification.getText();

    expect(error).to.eql(
      "Ім'я або пароль введено невірно" && "Увійдіть в кабінет"
    );
  });

  it("should not login successfully with empty credentials", async () => {
    await driver.get(Config.serverUrl);
    let usernameErrorNotification = await driver.findElements(
      By.css("#username-helper-text.Mui-error")
    );
    let passwordErrorNotification = await driver.findElements(
      By.css("#password-helper-text.Mui-error")
    );

    expect(usernameErrorNotification).to.eql([]);
    expect(passwordErrorNotification).to.eql([]);

    await driver.findElement(By.id("username")).sendKeys("");
    await driver.findElement(By.id("password")).sendKeys("", Key.RETURN);
    await driver.sleep(300);
    const error = await driver
      .wait(until.elementLocated(By.css(".MuiSnackbarContent-message")), 2000)
      .getText();

    expect(error).to.eql("Форма недійсна. Перевірте помилки");
    usernameErrorNotification = await driver.findElement(
      By.id("username-helper-text")
    );
    passwordErrorNotification = await driver.findElement(
      By.id("password-helper-text")
    );
    expect(usernameErrorNotification).to.be.an.instanceof(WebElement);
    expect(passwordErrorNotification).to.be.an.instanceof(WebElement);
  });
});
