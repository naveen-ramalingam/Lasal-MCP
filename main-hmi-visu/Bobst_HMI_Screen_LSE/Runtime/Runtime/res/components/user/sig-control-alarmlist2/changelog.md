# Changelog for sig-control-alarmlist2

## [02.03.000] - 2026-02-19
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Changed
- When alarms are deleted automatically, all alarms matching the auto-delete settings are now deleted at once instead of one by one. This avoids an endless loop if an unknown alarm (no variable number) matches the auto-delete settings.

## [02.02.000] - 2025-06-17
by _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Added a filter mode property for alarm groups to define how filters should be applied.
- Added exclude filter properties for the alarm groups.

## [02.01.000] - 2025-02-07
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Removed overwriting of private methods of the listview as the requested functionality was implemented in it. Therefore this version is only compatible with listview versions 02.00.001 and greater.
- Changed css selectors for styling alarms so they are displayed correct now when the list is deactivated.
- Register for alarm updates after dataservice connection established and default user logged in (access sequence ready)

## [02.00.002] - 2024-08-29
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed folder structure for imported libraries

## [02.00.001] - 2024-06-07
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Forwarding delete mode when auto deleting alarms to avoid timing problems if alarm gets activated directly again

## [02.00.000] - 2024-02-26
by _Anton Hötzenauer_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Changed
- Replace JavaScript with TypeScript 
- Performance improved for projects with many alarm configurations.

## [01.02.001] - 2023-11-28
by _Maximilian Leschanowsky_ of _SIGMATEK GmbH & Co KG_

### Changed
- Updated calls to the alarm api to account for new alarm objects, that can represent multiple alarms.

## [01.02.000] - 2023-07-20
by _Marcus Fiala_ and _Andreas Ramböck_ of _SIGMATEK GmbH & Co KG_

### Added
- Added LVD properties view tab assignment for all properties.

### Changed
- Set value of keep focus of the listview config (disableautodeactivate) to false.
- Used the column switching eventhandling directly from the base control

### Bugfix
- If a negative value for the alarm group filter is configured, no filter is applied

## [01.01.000] - 2023-01-13
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

### Changed
- Changed the list base component to listview due to performance issues with ag-grid.

## [01.00.000] - 2022-10-25
by _Mario Schmid_ of _SIGMATEK GmbH & Co KG_

- inital release.