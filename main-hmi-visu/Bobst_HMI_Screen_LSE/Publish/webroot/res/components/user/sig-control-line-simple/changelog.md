# Changelog for sig-control-line-simple

## [02.00.000] - 2024-02-07
by _Stefanie Hager_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replaced JavaScript with TypeScript

## [01.02.000] - 2023-05-09
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Added LVD properties view tab assignment for all properties.

### Changed
- Removed font property

## [01.01.001] - 2022-12-05
by _Christoph Obernosterer_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed commented code
- Removed deprecated css code

## [01.01.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

## [01.00.005] - 2021-12-07
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- The wrong base element was used
- The line was displayed with half a pixel offset for no reason

## [01.00.004] - 2021-10-21
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Fixed
- Line was displayed wrong on window due to different timing

## [01.00.003] - 2021-09-21
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Fixed
- Scale-Factor was not used for calculation of width and height.


## [01.00.002] - 2021-06-02
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed the visibility fix because it is no longer needed. The CSS properties are now set even before the component is attached to the DOM, so there is no need to hide the component before the properties are set.
- Renamed the callback _designerOnResize() to designerOnBoundsChanged()


## [01.00.001] - 2021-03-23
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- base component sig-element changed to sig-element-light to optimize performance.


## [01.00.000] - 2021-02-12
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Added
- Initial Release