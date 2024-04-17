import { expect } from "chai";
import Config from "./Config.js";
import { Builder, By, until, Key } from "selenium-webdriver";

const performLogin = async (driver) => {
  await driver.get(Config.serverUrl);
  await driver.wait(until.urlIs(`${Config.serverUrl}/#/login`), 2000);
  const usernameInput = await driver.findElement(By.id("username"));
  const passwordInput = await driver.findElement(By.id("password"));

  await usernameInput.sendKeys("gym1");
  await passwordInput.sendKeys("123123", Key.RETURN);
  await driver.wait(until.urlIs(`${Config.serverUrl}/#/`), 2000);
};

const buildDriver = () => new Builder().forBrowser("chrome").build();

const checkTexts = async (driver, selector, expectedResult) => {
  const loggedInUserElements = await driver.findElements(By.css(selector));
  const actualTexts = await Promise.all(
    loggedInUserElements.map((element) => element.getText())
  );

  expect(actualTexts).to.eql(expectedResult);
};

export { performLogin, buildDriver, checkTexts };
