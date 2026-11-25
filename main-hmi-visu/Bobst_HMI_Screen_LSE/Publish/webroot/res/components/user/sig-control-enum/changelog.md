# Changelog for sig-control-enum

## [03.00.001] - 2025-03-19
by _Mario Schmid_ of _SIGMATEK GmbH & Co 

### Changed
- changed name of handler function for tap.

## [03.00.000] - 2024-02-20
by _Stefanie Hager_ of _SIGMATEK GmbH & Co 

### Changed
- Replaced JavaScript with TypeScript.

## [02.00.000] - 2023-07-05
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co 

### Incompatible changes
- If a different image than the default for the dropdown symbol should be used, it previously needed to be done with a style class of the sig-control-image component.
  Due to performance and usability reasons, this was changed to be directly handled via an image tag. Therefore the Symbol image styling properties were removed.
  The images can now be set directly at the corresponding properties in group Symbol styling. If the component is updated the symbol images need to be configured at
  those properties or at the default styling of the enum control to work for all instances. This only needs to be done if a different symbol than the default should be used.

- The caret image has previously been an unicode sign. A size property was used to define the font size for it. Now the default image is set as an svg. The size property 
  is not needed anymore and was therefore removed. The size of the symbol can now be defined via the width property of the Symbol styling group as the aspect ratio is kept.
  After updating the component it should be checked if the size of the symbol is still displayed as required. If not the width property or the size of the image source can
  be changed so the symbol is displayed properly again.

- Coloring the caret symbol was removed as it isn't displayed as an unicode sign anymore. If the color of the symbol needs to be changed it now has to be done directly at 
  the image source.

### Added
- Added vertical text align property
- Added property for setting the top and bottom margin
- Added LVD properties view tab assignment for all properties.

### Changed
- Removed led
- Removed scale list and dragged opacity property
- Removed the background image functionality
- Renamed and regrouped properties
- The border width can now also be set as shorthand property
- Changed the name and function of the property text indent to margin left/right
- Default images are now used for the caret

### Bugfix
- Corrected designer preview position when used in a window

## [01.03.001] - 2023-03-15
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added control text list and reaction to change of project language or control text

## [01.03.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Added
- Added design project link

## [01.02.009] - 2022-06-02
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed eventhandler to tap event for closing the list

## [01.02.008] - 2021-10-21
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed _designerOnAppliedCSSValue to designerOnAppliedCSSValue()

## [01.02.007] - 2021-06-02
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- component now uses new designerOnBoundsChanged function instead of obsolete _designerOnResize
- changed function addRequiredProperty to sigAddRequiredProperty

## [01.02.006] - 2021-04-01
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- bugfix functionblock property is now called again

## [01.02.005] - 2021-01-19
by _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- standardized image 'strechmode' property

## [01.02.004] - 2020-12-01
by _Oliver Tomondy_ and _Jürgen Haring_ of _SIGMATEK GmbH & Co KG_

### Changed
- Optimized code for performance
- adjusted properties to match new property standard (sortIndex, userLevels)

## [01.02.003] - 2020-10-05
by _Marcus Fiala_ of _SIGMATEK GmbH & Co KG_

### Changed
- valueSourceType of property accessNumber

## [01.02.002] - 2020-08-19
by _Fabian Frauscher_ of _SIGMATEK GmbH & Co KG_

### Changed
- There is now an option to specify how many items should be shown in the list

## [01.02.001] - 2020-05-26
by _Mariella Galneder_ of _SIGMATEK GmbH & Co KG_

### Changed
- Default styling of Border shadow (so a change is visible with only one click)
- German descriptions translated 
- default styling
- default colors

## [01.02.001] - 2020-06-04
by _Vesna Vojinovic_ of _SIGMATEK GmbH & Co KG_

### Fixed
- fix for iOS: _!important_ added to _padding_ and/or _margin_ properties in selectors which have lower specificity than _:host *_

## [01.02.000] - 2019-09-20
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to default styling

## [01.01.001] - 2019-07-22
by _Oliver Tomondy_ of _SIGMATEK GmbH & Co KG_

### Changed
- Converted element to polymer 3

## [01.01.000] - 2019-03-27
by _Alexander Knett_ of _SIGMATEK GmbH & Co KG_

### Added
- inital release