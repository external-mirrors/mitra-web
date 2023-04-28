# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Don't show disabled login options.

### Fixed

- Move content warning behind the header.
- Enabled theme auto-detection for unauthenticated users.

## [1.22.0] - 2023-04-22

### Added

- Detect preferred color scheme.
- Show loading indicator while attachment is being uploaded.
- Content warnings.
- List enabled authentication methods in "Settings".

### Changed

- Send preferred authentication method along with user data when creating new account.

### Fixed

- Fix update of unread notification counter.

## [1.21.0] - 2023-04-12

### Changed

- Adjusted block background color in dark mode.

## [1.20.0] - 2023-04-07

### Added

- Added "Aliases" page.
- Form for adding aliases.
- Store appearance settings on server.

### Changed

- Move dark mode toggle out of "Experiments" section.

## [1.19.0] - 2023-03-30

### Added

- Define CSS variables for color theme.
- Added dark mode.

### Changed

- Don't revoke auth token when handling timeline loading error.
- Show error message if invoice can not be created.

## [1.18.0] - 2023-03-21

### Added

- Add "Copy profile ID" item to profile menu if current user is admin.

### Changed

- Show better error message if HTTP status code is 413.

### Fixed

- Fixed automatic logout on authentication error.

## [1.17.0] - 2023-03-15

### Added

- Enabled audio and video uploads.

### Changed

- Show alert if publishing of reply fails.
- Show alert if attachment upload fails.

## [1.16.0] - 2023-03-08

### Added

- Render custom emojis in display names.
- Display player for audio attachments.

### Changed

- Use `/@username` routes by default.

### Fixed

- Fixed text overflow in post subheader.
- Prevent display name from shrinking too much in post headers and follow notifications.
- Log out if authentication error happens during timeline reload.

## [1.15.0] - 2023-02-27

### Added

- Show "Alias" badge on profile page if account has aliases.

### Changed

- Use `/feeds/users/{username}` path for user's Atom feed.
- Read error messages from `error_description` field instead of `message`.

## [1.14.0] - 2023-02-22

### Added

- Show current username in HTML page title.

### Changed

- Remove invisible characters from display names.
- Use `/api/v1/statuses/{status_id}/thread` API endpoint to load threads.
- Use `<input type="search">` for search bar.
- Changed custom emoji vertical alignment and size.
- Expect `/api/v1/statuses` to return status code 200.
- Insert application-name meta tag at build time.
- Disable post submission button while attachment is being uploaded.

## [1.13.0] - 2023-02-06

### Added

- Reload home timeline when clicking on "Home" button.

### Changed

- Improved username validation.
- Hide subscription settings page if user doesn't have permission to manage subscriptions.

### Fixed

- Restore payment details when navigating back to subscription payment page from another page.
- Disable visibility menu in reply if parent post is not public.

## [1.12.0] - 2023-01-26

### Added

- Enlarge custom emojis on hover.

### Changed

- Disabled posting and reposting if current user doesn't have `create_post` permission.

## [1.11.0] - 2023-01-23

### Added

- Show number of subscribers on subscription settings page.
- Render emojis when previewing post.

### Fixed

- Show full date and time in post timestamp tooltip.
- Show error message if profile details can't be updated.
- Set file name for follower/following list downloads.

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
