Feature: BestBuy search filters

  Background:
    Given the user is on the BestBuy home page

  Scenario Outline: Search. Filter by Brand
    When the user searches for laptop
    And filters by brand: <Brand Name>
    Then every listed product has the selected brand: <Brand Name>
    Examples:
      | Brand Name |
      | ASUS       |
      | Dell       |
      | Lenovo     |
  Scenario: Search. Filter by Television Type
    When the user searches for television
    And filters by television type: Smart
    Then every listed product has the selected television type: Smart

  Scenario Outline: Search. Filter by Rating
    When the user searches for cellphones
    And filters by rating: <Score>
    Then every listed product has the selected rating: <Score>
    Examples:
      | Score |
      | 2     |
      | 3     |
      | 4     |

  Scenario: Search. Filter by Price
    When the user searches for camera
    And filters it by price: 25 to 49.99
    Then every listed product has a price between 25 and 49.99

  Scenario: Search. Filter by Custom Price
    When the user searches for smartwatch
    And filters it by customprice: 100 to 200
    Then every listed product has a price between 100 and 200