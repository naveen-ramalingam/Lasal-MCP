# Changelog for sig-designer-rulers

## [01.03.000] - 2026-04-08
by _Alexander Knett_ of _SIGMATEK GmbH & Co KG_

### Changed
- Refactored core logic for improved performance and maintainability
- Added support for styling the component using CSS variables
- Updated event handling to ensure compatibility with latest browser APIs
- Enhanced ruler rendering for higher accuracy and responsiveness
- The vertical and horizontal  guidelines can now be rested together by clicking the rulers corner.

### Fixed
- Resolved issues with incorrect ruler scaling on high-DPI displays
- Fixed minor bugs related to user interaction and snapping behavior
- Improved error handling for edge cases during initialization
- The guideline color gets now updated correctly.
- The guidelines can now be enabled / disabled after the dashboard was loaded.
- The guidelines current positions are now longer lost while enabling / disabling the guidelines (still are reset on dashboard loading)
- The guidelines no longer appear in the rulers background if they are not active.

## [01.02.000] - 2019-09-20
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to default styling

## [01.01.001] - 2019-07-19
by _RSC_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to polymer 3

## [01.01.000] - 2019-03-11
by _Robert Schild_ of _SIGMATEK GmbH & Co KG_

### Added
- initial release