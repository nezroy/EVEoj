# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.3.0] - 2016-05-26
### general changes
- removed JSONP support
- space types renamed; X replaces J (Jove/other), J replaces W (wormhole); K is still K
- updated to 3.4.0 of BlueBird (embedded normally anyway, unless you are using core version)
- all promise handling and usage improved, and promise chaining improved
- promise rejections now use built-in Error types instead of custom hashes

### solar system changes (map.System)
- `stars` and `objects` load settings added
- `celestials` and `statistics` load settings removed
- systems no longer have luminosity, factionID, or sunTypeID (use mapStars raw data instead)

## Schema 201604290 - 2016-05-26
### SDD schema changes with Citadel 1.1
- space types renamed; X replaces J (Jove/other), J replaces W (wormhole); K is still K
- mapSolarSystems position data changed to 3-tuples (0:x, 1:y, 2:z)
- mapSolarSystems available columns have changed (see metainf for details)
- mapSolarSystemJumps moved to separate datafile since mapSolarSystems now contains embedded jump info
- gate ID data now in mapGates, not mapSolarSystemJumps
- mapCelestials and celestial statistics removed; stars moved to new mapStars, station data exists in staData
- mapSolarSystemObjects added as reference lookup for objects (gates, stations, moons, etc.) by solar system ID
- datafiles for ramData split into ramMeta and ramBlueprints
- invTypes and invTypesDesc available columns have changed (see metainf for details)
- staStationTypes and staStations available columns have changed (see metainf for details)

[0.3.0]: https://github.com/xyjax/EVEoj/compare/v0.3.0...v0.2.0