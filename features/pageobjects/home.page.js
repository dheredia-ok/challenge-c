const Page = require("./page");

const defaultXPath = "//input[contains(@id, '";
const resultTitleXPath = "//div[contains(@id, 'shop-sku-list-item')]//h4/a";
const resultRatingScoreXPath =
  "//div[contains(@id, 'shop-sku-list-item')]//div/a//p";
const resultPriceXPath =
  "//div[contains(@id, 'shop-sku-list-item')]//div[contains(@class,'pricing')]//span[@aria-hidden='true']";

class HomePage extends Page {
  get searchInput() {
    return $('//*[@id="gh-search-input"]');
  }

  get cartIcon() {
    return $('//div[contains(@id, "shop-cart-icon")]');
  }
  get btnSubmit() {
    return $('//header//button[@type="submit"]');
  }

  //price-related xpaths
  get minPrice() {
    return $('//*[@id="min-currentprice_facet-input"]');
  }

  get maxPrice() {
    return $('//*[@id="max-currentprice_facet-input"]');
  }

  get priceRangeButton() {
    return $('//*[@id="main-filters"]//section[1]/fieldset/div/button');
  }

  get clearPricesLink() {
    return $('//*[@id="main-filters"]//div[2]/button');
  }

  //result-related xpaths
  get numberOfItems() {
    return $('//span[@class="item-count"]');
  }

  get unpricedItemsList() {
    return $(
      '//button[@class="priceView-tap-to-view-price priceView-tap-to-view-price-bold"]'
    );
  }
  get resultTitleList() {
    return $$('//div[contains(@id, "shop-sku-list-item")]//h4/a');
  }

  get resultRatingScoreList() {
    return $$('//div[contains(@id, "shop-sku-list-item")]//div/a//p');
  }
  get resultPriceList() {
    return $$(
      '//div[contains(@id, "shop-sku-list-item")]//div[@class="priceView-hero-price priceView-customer-price"]//span//text()[2]'
    );
  }

  myXPath(criteria, value) {
    var customXPath = "";

    switch (criteria) {
      case "brand":
        customXPath = defaultXPath + criteria;
        break;
      case "television type":
        customXPath = defaultXPath + "televisiontype";
        break;
      case "rating":
        customXPath = defaultXPath + "customerreviews";
    }

    customXPath += "_facet-" + value + "')]";

    return customXPath;
  }

  async search(word) {
    await browser.pause(4000);
    await this.cartIcon.waitForDisplayed({ timeout: 6000 });
    await this.searchInput.clearValue();
    await this.searchInput.setValue(word);
    await browser.keys("\uE007");
  }

  //filter and "unfilter":
  async filterBy(criteria, value) {
    let initialItemCountStr, filterXPath, filter;

    await this.numberOfItems.waitForDisplayed({ timeout: 60000 });

    initialItemCountStr = await this.numberOfItems.getText();

    filterXPath = this.myXPath(criteria, value);

    filter = $(filterXPath);
    await filter.waitForClickable({ timeout: 30000 });

    await filter.scrollIntoView();
    await filter.click();

    //wait until the filter is applied (until the item count is changed)
    await browser.waitUntil(
      async () => (await this.numberOfItems.getText()) != initialItemCountStr,
      {
        timeout: 30000,
        timeoutMsg:
          "expected item count to be different after the defined time",
      }
    );
  }

  async filterByPrice(criteria, lowerPrice, higherPrice) {
    await this.numberOfItems.waitForDisplayed({ timeout: 60000 });

    let initialItemCountStr = await this.numberOfItems.getText();

    if (criteria == "customprice") {
      //if it is a custom price
      await this.minPrice.waitForDisplayed({ timeout: 30000 });
      await this.maxPrice.waitForDisplayed({ timeout: 30000 });

      //setting values:
      await this.minPrice.setValue(lowerPrice);
      await this.maxPrice.setValue(higherPrice);

      //submitting...
      await browser.keys("\uE007");
    } else {
      //if it is NOT a custom price... click on the filter
      //creating filter xpath...
      let priceXPath =
        defaultXPath + "currentprice_facet-$" + lowerPrice + "-')]";

      //clicking on the filter xpath...
      await $(priceXPath).waitForClickable({ timeout: 30000 });

      await $(priceXPath).scrollIntoView();
      await $(priceXPath).click();
    }
    //wait until the filter is applied (until the item count is changed)
    await browser.waitUntil(
      async () => (await this.numberOfItems.getText()) != initialItemCountStr,
      {
        timeout: 30000,
        timeoutMsg:
          "expected item count to be different after the defined time",
      }
    );
  }

  async checkEveryItem(criteria, value) {
    var resultArray; //number of results that should be shown on a page.

    await browser.pause(6000);
    switch (
      criteria //brand / television_type / rating
    ) {
      case "brand":
      case "television type":
        // assert if the title contains the value of the criteria

        resultArray = await $$(resultTitleXPath); //resultArray: the ACTUAL results shown on a page

        await browser.waitUntil(async () => (await resultArray.length) > 0, {
          timeout: 60000,
          timeoutMsg:
            "expected item count to be different after the defined time",
        });

        for (var i = 0; i < (await resultArray.length); i++) {
          await resultArray[i].waitForDisplayed({ timeout: 2000 });
          await resultArray[i].scrollIntoView();
          expect(await resultArray[i]).toHaveTextContaining(value);
        }
        break;
      case "rating":
        var isInInterval,
          proposedScore,
          ratingText,
          ratingScore,
          ratingScoreStr;

        resultArray = await $$(resultRatingScoreXPath);

        proposedScore = parseFloat(value);

        await browser.waitUntil(async () => (await resultArray.length) >= 0, {
          timeout: 60000,
          timeoutMsg:
            "expected item count to be different after the defined time",
        });

        for (var i = 0; i < (await resultArray.length); i++) {
          await resultArray[i].waitForDisplayed({ timeout: 2000 });
          await resultArray[i].scrollIntoView();

          ratingText = await resultArray[i].getText();
          ratingScoreStr = ratingText.split(" ")[1]; //the second substring is the numeric rating score
          ratingScore = parseFloat(ratingScoreStr);

          if (ratingScore >= proposedScore) {
            isInInterval = true;
          } else {
            isInInterval = false;
          }

          expect(isInInterval).toBe(true);
        }
    }
    await browser.pause(2500);
  }

  async checkEveryPrice(lowerPrice, higherPrice) {
    var isInInterval,
      resultArray,
      itemPrice,
      itemPriceStr; //number of PRICED results that are shown on a page.

    await browser.pause(6000);

    resultArray = await $$(resultPriceXPath);

    await browser.waitUntil(async () => (await resultArray.length) >= 0, {
      timeout: 30000,
      timeoutMsg: "expected item count to be different after the defined time",
    });

    for (var i = 0; i < (await resultArray.length); i++) {
      await resultArray[i].waitForDisplayed({ timeout: 2000 });
      await resultArray[i].scrollIntoView();

      itemPriceStr = await resultArray[i].getText();
      itemPrice = parseFloat(itemPriceStr.replace(/\$/g, ""));

      if (itemPrice >= lowerPrice && itemPrice <= higherPrice) {
        isInInterval = true;
      } else {
        isInInterval = false;
      }

      expect(isInInterval).toBe(true);
    }
    await browser.pause(2500);
  }

  open() {
    return super.open();
  }
}

module.exports = new HomePage();
