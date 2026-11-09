Feature: F1 Add two numbers

  @story-F1.1 @story-F1.2
  Rule: A signed-in user sees the sum of the two numbers they submit, below the form

    Scenario: Adding a decimal and a negative number
      Given Nimali the user is signed in and on the calculator page
      When Nimali enters "12.5" and "-4.25" and submits
      Then the answer "8.25" is shown below the form

    Scenario: Adding two whole numbers
      Given Nimali the user is signed in and on the calculator page
      When Nimali enters "2" and "3" and submits
      Then the answer "5" is shown below the form

  @story-F1.3
  Rule: Only two valid numbers may be submitted

    @negative
    Scenario: An empty field blocks submission
      Given Nimali the user is signed in and on the calculator page
      When Nimali enters "7" in the first field, leaves the second empty and submits
      Then no answer is shown
      And a message appears beside the second field

    @negative
    Scenario: A non-numeric value blocks submission
      Given Nimali the user is signed in and on the calculator page
      When Nimali enters "abc" and "4" and submits
      Then no answer is shown
      And a message appears beside the first field

  @story-F1.4
  Rule: A new submission replaces the previous answer

    Scenario: Submitting again with different numbers
      Given Nimali has submitted "2" and "3" and sees the answer "5"
      When Nimali changes the numbers to "10" and "-1" and submits
      Then the answer "9" is shown and "5" is no longer shown

  @story-F1.5
  Rule: When the sum cannot be calculated the user is told

    @negative
    Scenario: The calculation service is unavailable
      Given Nimali the user is signed in and the calculation service is unavailable
      When Nimali enters "2" and "3" and submits
      Then no answer is shown
      And a message says the sum could not be calculated
