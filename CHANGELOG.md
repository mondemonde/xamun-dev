# Change Log

All notable changes to the "claude-dev" extension will be documented in this file.

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [0.9.74]

### Added
- New feature: Daily total cost tracking
  - Implemented a system to monitor and display the total cost of all tasks for a day
  - Added a `dailyTotalCost` state in the ChatView component to track cumulative cost
  - Created an `updateDailyTotalCost` function to update and store the daily total cost in localStorage
  - Added logic to load daily total cost from localStorage and reset it at the start of a new day
  - Updated the TaskHeader component to display the daily total cost when a task is active
  - Added a display of the daily total cost in the main view when no task is active

