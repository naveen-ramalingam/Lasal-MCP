# Changelog for sig-control-enum-list

## [03.00.001] - 2025-03-19
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Overworked scroll handling as entries were selected when scrolling on touch (track)

## [03.00.000] - 2024-02-20
by _Stefanie Hager_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replaced JavaScript with TypeScript.

## [02.00.000] - 2023-07-06
by _Andreas Ramböck_ and _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Incompatible changes
- There was a constant 8px border for the list items which works like a padding. To be able to style the list items properly two margin properties (Margin left/right, 
  Margin top/bottom) have been implemented. After updating the margin properties may need to be set to display the list items like before as the constant padding of 8px
  was removed. You can configure the margin in the default styling to avoid setting those properties at all instances.

### Added
- Added vertical text align property
- Added LVD properties view tab assignment for all properties.
- Added scroll bar if the list is too long and has to be scrolled.
- Added border radius property.

### Changed
- Removed led
- Removed dragged opacity property
- The border width can now also be set as shorthand property
- Changed positioning of the list. If there is not enough space at the specified position, the opposite position will be used
- If the number of entries doesn't fit into the provided space, the list becomes automatically scrollable to make all entries accessible

## [01.03.001] - 2023-09-19
by _Christoph Obernosterer_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed type of pixel properties to constString, added missing default values

## [01.03.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

## [01.02.006] - 2021-12-03
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed function calls like addEventListener, setTimeout and setInterval to ones with sig-prefix to avoid memory leaks.

## [01.02.005] - 2021-10-21
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed _designerGenerateStylePreview to designerGenerateStylePreview

## [01.02.004] - 2020-11-17
by _Oliver Tomondy_ and _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- Optimized code for performance
- adjusted properties to match new property standard (sortIndex, userLevels)

## [01.02.003] - 2020-09-08
by _Maximilian Leschanowsky_ of _SIGMATEK GmbH & Co KG_

### Changed
- Fixes an error where the control didn't work if the value was a scheme

## [01.02.002] - 2020-08-19
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- There is now an option to specify how many items should be shown in the list

## [01.02.001] - 2020-05-26
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- German descriptions translated 
- default styling
- default colors

## [01.02.000] - 2019-09-09
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Added
- inital release, compatible with default styling