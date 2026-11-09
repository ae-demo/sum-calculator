# Add two numbers

## Purpose

A user provides two numbers on a page, submits them, and sees their sum calculated by the back service.

## User Stories

- F1.1 As a user, I enter two numbers in separate fields and submit them.
- F1.2 As a user, I see the sum of my two numbers below the form on the same page.
- F1.3 As a user, I am told beside the field when it is empty or not a number, and the form is not submitted.
- F1.4 As a user, I edit the numbers and submit again, and the new answer replaces the previous one.
- F1.5 As a user, I see a clear message when the sum cannot be calculated because the back service is unavailable.

## Decisions

- The answer appears on the same page, below the form.
- Invalid input is caught on the page before anything is sent, with a message beside the offending field.
- A new sum is made by editing the fields and submitting again; there is no Clear button.
- The sum is shown exactly as calculated, without rounding.

## Out of Scope

- A separate results page.