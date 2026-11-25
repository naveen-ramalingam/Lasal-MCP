# Changelog for sig-control-bar-straight

## [04.00.000] - 2024-02-12
by _Anton Hötzenauer_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replacing JavaScript with TypeScript
- Fixed an issue where limits were shown in the preview even if they haven't been configured

## [03.00.000] - 2023-06-26
by _Andreas Ramböck_ and _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Incompatible changes
- In previous versions the bar image was shifted depending on the actual value. As mentioned in the description of the property the image 
  should be used to fill the bar depending on the actual value to be able to style it in every possible way. The behavior was changed to work like that.
  If in the uncommon case that the bar image has been used before the update, the behavior needs to be checked and adapted after updating to fit the users requirement.

### Added
- Added preview
- Added LVD properties view tab assignment for all properties.
- Added Fill color stop property to be able to set a gradient

### Changed
- Reworked bar image handling. It now covers step by step the background image (if set) instead of moving from outside into the control.
- The border radius and width can now also be set as shorthand property
- Removed dragged opacity
- Renamed and reorganized properties and categories

## [02.01.001] - 2023-02-07
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Corrected limit check for range limits so the bar is now displayed in the correct color again

## [02.01.000] - 2022-11-29
by _Mario Schmid_, _Andreas Ramböck_ and _Christoph Obernosterer_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

### Changed
- Removed unnecessary code
- Added predef property to get unconverted values for calculation

## [02.00.006] - 2021-06-02
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

## Changed
- Renamed function _addRequiredProperty() to sigAddRequiredProperty()
- Renamed callback _onRequiredPropertiesReady() to sigOnRequiredPropertiesReady()

## [02.00.005] - 2021-05-10
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- Bar image is now an img tag, to prevent flickering in the online preview, and in the browser

## [02.00.004] - 2021-03-22
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- drawing of bar if properties ready
- values and limits are now calculated to base unit before calculating the bar size
- bar is now displayed via translate instead of translate3d which brought the bar to front if rotated
- the percentage of the bar level is now checked for NaN
- performance update and base element changed to sig-element-light

## [02.00.003] - 2020-11-25
by _Marijo Knezovic_ and _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- #4218 Fixed an issue which would cause background color to show on the bottom of the bar even though the image has been selected as background 
- adjusted properties to match new property standard (sortIndex, userLevels)

### Added
- Properties Range Color Low Limit and High Limit
- Properties Range Color Low and Range Color High
- barmin and barmax divs to initial html structure
- initial styles for new divs
- functionality of color ranges for drawing

## [02.00.002] - 2020-06-15
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- shortNames and group of all properties are now in english
- changed Min. and Max.
- Groups Border, Bar styling and Background styling are put together into group General styling
- Properties of group general settings placed into group Data
- default styling
- default color

### Added
- placementTemplate 

## [02.00.001] - 2020-03-11
by _Zeilberger Philipp_ of _SIGMATEK GmbH & Co. KG_

### Added
- the possibility to use the default styling.

## [02.00.000]
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- Switch to Poylmer 3
- Design Standard Template

## [01.00.000] - 2019-12-04
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Added
- Initial release