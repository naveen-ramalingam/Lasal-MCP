# Changelog for sig-control-listview

## [02.00.003] - 2026-05-18
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Bugfix
- Corrected adding the tap, down and up event listeners as polymer events.

## [02.00.002] - 2025-04-10
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Bugfix
- Setting already clicked at click callbacks to display selected rows accordingly
- Checking for active row corrected as it needs to be evaluated strict if not null

### Changed
- Changed init value of selectRowafterFirstClick to true as behavior is default like this

## [02.00.001] - 2025-01-17
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Bugfix when scrolling to the very bottom and lazy loading is activated
- Column wasn't evaluated correctly before it was passed to the callback functions like click, doubleClick and longPress
- Changed click event handling and double click detection as event target wasn't evaluated correct
- The longpress callback is now also called if the multiselection is deactived. In that case the line is set active.
- Overworked css selectors to avoid many !important declarations
- Overworked handlers as there is a gesture mixin available and so there is no need for adding mouse and touch event listeners seperate
- Overworked activate handling as the previous activated line was displayed active for a short time

## [02.00.000] - 2024-02-21
by _Stefanie Hager_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replaced JavaScript with TypeScript.

## [01.04.000] - 2023-06-27
by _Andreas Ramböck_ and _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Added
- Added properties for column navigation
- Added properties for vertical alignment of elements in header and rows
- Added functionality to deactivate the listview on an outside tap
- Added LVD properties view tab assignment for all properties.

### Changed
- Removed property dragged opacity
- Removed property disable keys
- Renamed disable auto deactivate to keep focus and set the default value to true

## [01.03.001] - 2023-03-15
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added control textlists to be able to define custom texts

## [01.03.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

### Changed
- Removed disabled if statement as disabled isn't a property

## [01.02.004] - 2022-06-14
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed unused code

## [01.02.003] - 2021-12-03
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed function calls like addEventListener, setTimeout and setInterval to ones with sig-prefix to avoid memory leaks.

## [01.02.002] - 2020-11-30
by _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- adjusted properties to match new property standard (sortIndex, userLevels)

## [01.02.001] - 2020-06-26
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- default colors

## [01.02.000] - 2019-09-20
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to default styling

## [01.01.001] - 2019-07-22
by _RSC_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to polymer 3

## [01.01.000] - 2019-03-08
by _RSC_ of _SIGMATEK GmbH & Co KG_

### Added
- inital release