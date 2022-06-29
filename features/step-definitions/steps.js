const { Given, When, Then } = require("@wdio/cucumber-framework");

const HomePage = require("../pageobjects/home.page");

Given(/^the user is on the BestBuy home page$/, async () => {
  await HomePage.open();
});

When(/^the user searches for (.*)$/, async (word) => {
  await HomePage.search(word);
});

Then(/^filters by (.*): (.*)$/, async (criteria, value) => {
  await HomePage.filterBy(criteria, value);
});

Then(/^filters it by (.*): (.*) to (.*)$/, async (criteria, value1, value2) => {
  await HomePage.filterByPrice(criteria, value1, value2);
});

Then(
  /^every listed product has a price between (.*) and (.*)$/,
  async (value1, value2) => {
    await HomePage.checkEveryPrice(value1, value2);
  }
);

Then(
  /^every listed product has the selected (.*): (.*)$/,
  async (criteria, value) => {
    await HomePage.checkEveryItem(criteria, value);
  }
);
