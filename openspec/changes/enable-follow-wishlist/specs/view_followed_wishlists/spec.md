# Spec: View Followed Wishlists

## ADDED Requirements

### Requirement: Display Followed Wishlists on Dashboard
The main dashboard MUST display a distinct section for wishlists that the current user follows.

#### Scenario: User views dashboard with followed lists
Given I am logged in
And I follow at least one wishlist
When I view the dashboard
Then I should see a "Following" section
And I should see cards for each followed wishlist
And each card should display the List Name and the Owner's Name

#### Scenario: Recent Update Indicator
Given I follow a wishlist
And the wishlist was updated in the last 24 hours
When I view the followed list card
Then I should see a "Recent" indicator/flag

#### Scenario: Layout for Multiple Lists
Given I follow many wishlists (e.g., 10+)
When I view the "Following" section
Then the list should be displayed in a multi-column grid
And the section should be vertically scrollable to accommodate all items

### Requirement: internal Unfollow Action
Users MUST be able to unfollow a list directly from the dashboard view.

#### Scenario: Unfollow from Dashboard
Given I identify a list I want to unfollow
When I click the "Unfollow" action on the card
Then the list should be removed from my "Following" section immediately
