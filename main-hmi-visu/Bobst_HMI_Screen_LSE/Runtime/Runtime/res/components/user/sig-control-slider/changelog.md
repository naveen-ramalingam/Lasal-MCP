# Changelog for sig-control-slider

## [03.00.002] - 2026-02-04
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed unnecessary code parts.
- Reworked some types.
- Updated handling of observers.

## [03.00.001] - 2025-10-13
by _Felix Jütte_ of _SIGMATEK GmbH & Co KG_

### Added
- Added functionality tapping to the left or right of the slider (or above/below for vertical sliders) increases/decreases value by the specified property.
- Added functionality on tap down interval to increment/decrement again.
- change valueuc type to number

## [03.00.000] - 2024-02-13
by _Stefanie Hager_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replace JavaScript with TypeScript.

## [02.02.001] - 2023-11-29
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed calculation of handle position to % so it is applied correct if the control was hidden and then displayed
- Changed the calculation of the position if rotated as only steps in 90° are allowed
- Changed handling with bar as it didn't start at 0 and didn't end at 100% of track

## [02.02.000] - 2023-06-07
by _Marcus Fiala_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Added functionality to set min- max-limits via properties.
- Added functionality to invert the direction.
- Added LVD properties view tab assignment for all properties.

### Changed
- Handle width and height can now also be set in %.
- Fixed appearance of pressed handle and added a stop color property to it.
- The calculations are now done only in the base unit.
- The border radius and width in general styling can now also be set as shorthand properties.
- Removed scale and limit exceeded functionality.
- Removed no longer needed properties and styling.
- Removed mouse-leave/mouse-enter functionality.
- Removed property Continuous updates.
- Removed dragged opacity and font property.
- Click position detection works now correct for all rotation values.

### Bugfix
- When changing the width of the handle, the handle now stays in the centered position

## [02.01.002] - 2023-05-17
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed background-color of hotspot-area.

### Bugfix
- Restored pressed-state of handle.

## [02.01.001] - 2022-12-19
by _Christoph Obernosterer_ of _SIGMATEK GmbH & Co KG_

### Changed
- Cleanup code (improved comments, removed commented code, removed not necessary logmessages, variables and methods)
- Removed not used css variables, css settings and variables

## [02.01.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

### Changed
- Removed disabled property as disabling should be done by state

## [02.00.006] - 2022-06-14
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added a color stop and gradient direction property

## [02.00.005] - 2021-12-03
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed function calls like addEventListener, setTimeout and setInterval to ones with sig-prefix to avoid memory leaks.

## [02.00.004] - 2021-06-06
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Renamed function _addRequiredProperty() to sigAddRequiredProperty().
- Renamed callback _onRequiredPropertiesReady() to sigOnRequiredPropertiesReady().
- Renamed callback _designerOnResize() to designerOnBoundsChanged().

## [01.02.003] - 2020-12-01
by _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- adjusted properties to match new property standard (sortIndex, userLevels)

## [01.02.002] - 2020-10-05
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- valueSourceType of property accessNumber

## [01.02.001] - 2020-05-26
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- German descriptions translated 
- default styling
- default colors

## [01.02.001] - 2020-06-04
by _Vesna Vojinovic_ of _SIGMATEK GmbH & Co KG_

### Fixed
- fix for iOS: _!important_ added to _padding_ and/or _margin_ properties in selectors which have lower specificity than _:host *_

## [01.02.000] - 2019-09-20
by _Vesna Vojinovic_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to default styling

## [01.01.001] - 2019-07-19
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to polymer 3

## [01.01.000] - 2019-03-21
by _Alexander Knett_ of _SIGMATEK GmbH & Co KG_

### Added
- inital release