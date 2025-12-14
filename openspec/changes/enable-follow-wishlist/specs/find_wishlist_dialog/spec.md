# Spec: Find Wishlist Dialog

## ADDED Requirements

### Requirement: Find Wishlist Dialog Access
Users MUST be able to open a dialog to find and follow new wishlists.

#### Scenario: Open Dialog
Given I am on the dashboard
When I click the "Find Wishlist" button (next to "Create New Wishlist")
Then a "Find Wishlist" dialog should open

### Requirement: Search Functionality
The dialog MUST support searching by multiple input types.

#### Scenario: Search by User Name
Given the dialog is open
When I enter a user's name (e.g., "Alice")
And I trigger the search
Then I should see a list of public wishlists owned by users matching "Alice"

#### Scenario: Search by Share URL
Given the dialog is open
When I paste a valid Wishlist Share URL
And I trigger the search
Then I should see the specific wishlist corresponding to that URL

#### Scenario: Search by Share Token
Given the dialog is open
When I enter a valid Share Token
And I trigger the search
Then I should see the specific wishlist corresponding to that token

### Requirement: Follow Action from Search
Users MUST be able to follow a list found via search.

#### Scenario: Follow a Found List
Given I have performed a search
And results are displayed
When I click "Follow" on a result
Then the list should be added to my followed lists
And the button state should change to indicate "Following"
