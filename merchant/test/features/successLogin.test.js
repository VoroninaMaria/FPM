import { expect } from "chai";
import { By } from "selenium-webdriver";

import { performLogin, buildDriver } from "../shared.js";

describe("Successfull login", () => {
  let driver;

  beforeEach(() =>
    buildDriver().then((builtDriver) => {
      driver = builtDriver;

      return performLogin(driver);
    })
  );

  afterEach(() => driver.quit());

  it("should login successfully with valid credentials", async () => {
    const usernameInput = await driver.findElements(By.css("#username"));
    const passwordInput = await driver.findElements(By.css("#password"));

    expect(usernameInput).to.be.empty;
    expect(passwordInput).to.be.empty;
  });
});
