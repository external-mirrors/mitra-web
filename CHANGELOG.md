# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Show number of subscribers on subscription settings page.

### Fixed

- Show full date and time in post timestamp tooltip.
- Show error message if profile details can't be updated.

## [1.10.0] - 2023-01-18

### Added

- Added "Experiments" section to Settings page (includes "Move Followers" feature).
- Show error message if moving of followers fails.
- Added "Import Follows" page.
- Display custom emojis.
- Show actor address in repost action tooltip.

### Changed

- Use `/api/v1/settings/move_followers` endpoint to move followers.

## [1.9.0] - 2023-01-08

### Added

- Added `/@username` routes for profile pages.
- Allowed to attach image from clipboard.
- Started using media limits provided by the backend.
- Send avatar and banner media types to server when updating profile info.

### Changed

- Changed text on Ethereum page.
- Not showing profile stats if profile is remote.
