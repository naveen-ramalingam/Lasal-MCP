# Changelog for sig-control-numeric-input

## [04.00.000] - 2026-02-06
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Incompatible changes
- Previously the converted values of the value and the incamount were used. This could lead to problems when handling with datapoints which have a unit or unit scheme configured. If that is the case and constant values for the incamount is used, you now need to make sure that it is configured unitless. 
E.g., if you want to set increase a datapoint with the unit mm (1mm = 10000) by 1mm, you need to configure 10000 as the incamount instead of 1.

### Changed
- Writing the unconverted values directly via datapoint manager api methods.

## [03.00.001] - 2025-10-22
by _Felix Jütte_ of _SIGMATEK GmbH & Co KG_

### Added
- Added property preview for easier styling of the active state in the designer.

## [03.00.000] - 2024-02-13
by _Stefanie Hager_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replaced JavaScript with TypeScript.
- Improved description of "Update on same value" property

## [02.02.001] - 2024-01-18
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Added a property to activate writing of the data point, configured at the value property, even if the value doesn't change.

## [02.02.000] - 2023-06-07
by _Marcus Fiala_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Properties for vertical align.
- Added LVD properties view tab assignment for all properties.

### Changed
- Showing the selected unit directly in the designer instead of the placeholder
- The border width can now also be set as shorthand property
- Removed property dragged opacity.
- Removed function block on value changed.
- Moved properties interval type and interval time to group button settings.

## [02.01.000] - 2022-10-05
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed unnecessary render callback.
- Changed css and html tags to increase performance.
- Changed selection of input to tap to avoid keyboard when scrolling.
- Removed disabled property as disabling input should be done by state.

### Added
- Added design project link

## [02.00.010] - 2022-05-31
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed box-shadow that was always visible independent of the border shadow settings.

## [02.00.009] - 2022-01-28
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Unit was displayed in the wrong position when using unitscheme. Added update if unittext changes.

## [02.00.008] - 2021-12-03
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed function calls like addEventListener, setTimeout and setInterval to ones with sig-prefix to avoid memory leaks.

### Added
- Added the unit conversion mixin.

## [02.00.007] - 2021-10-18
by _Mario Schmid_ of _SIGMATEK Gmbh & Co KG_

### Changed
- changed __ access to getter methods
- Check if component was already rendered before trying to rerender

## [02.00.006] - 2021-06-14
by _Fabian Frauscher_ of _SIGMATEK Gmbh & Co KG_

### Changed
- fixes a bug where the increment and decrement buttons would write wrong values.

## [02.00.005] - 2021-03-24
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- Due to performance improvements, the way getControlBounds works has been changed. The control was adjusted.

## [02.00.004] - 2021-03-23
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- performance improvements
- style was update 3 times due to observer of unitchange -> fixed

## [02.00.003] - 2020-11-30
by _Frauscher Fabian_ and _Oliver Tomondy_ and _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- valueSourceType of property accessNumber
- Fixes a bug, where the increase and decrease Buttons don't work if the datapoint has a unit
- Optimized code for performance
- Refactored code for new Keyboard Implementation
- Added "Keyboard on Dashboard" functionality
- adjusted properties to match new property standard (sortIndex, userLevels) - HARJUE

## [02.00.002] - 2020-06-18
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- shortNames and group of all properties are now in english
- adjusted placementTemplate text
- default styling
- default colors

## [02.00.001] - 2020-03-11
by _Zeilberger Philipp_ of _SIGMATEK GmbH & Co. KG_

### Added
- the possibility to use the default styling.

## [02.00.000]
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- Switch to Poylmer 3
- Design Standard Template

## [01.00.000] - 2019-03-01
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Added
- inital release