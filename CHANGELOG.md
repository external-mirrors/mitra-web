# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Added French translation.
- Support attachment uploading via drag-and-drop.

### Changed

- Updated translations ([#51](https://codeberg.org/silverpill/mitra-web/pulls/51), [#52](https://codeberg.org/silverpill/mitra-web/pulls/52)).
- Add tooltip to disabled visibility selector.
- Set visibility to "Followers" when self-replying to followers-only post.
- Enable username autocomplete on login form.
- Don't allow to edit posts with text/html content type.
- Expect status code 200 when deleting post.

### Fixed

- Disable visibility menu when editing existing post.
- Fixed padding on username input addon.

## [3.9.0] - 2024-11-07

### Added

- Support RTL text in posts and profile descriptions.
- Allow followers-only self-replies to followers-only posts.
- Allow replies with "conversation" visibility to followers-only posts.

### Changed

- Improved descriptions of visibility scopes.
- Changed subscription icon.
- Don't hide post menu after bookmarking.
- Move "Hide image" button to top right corner of image.

### Removed

- Removed FreeBSD patch.

### Fixed

- Fix FreeBSD build.
- Fix broken "View post" button on sensitive images in gallery.

## [3.8.0] - 2024-10-25

### Added

- Add `Idempotency-Key` header to request when publishing a new post.

## [3.7.0] - 2024-10-16

### Changed

- Updated translations ([#49](https://codeberg.org/silverpill/mitra-web/pulls/49)).

### Fixed

- Don't change text color on hover when "Publish" button is disabled.

## [3.6.0] - 2024-10-03

### Added

- Added titles to all pages.
- Allow to edit custom feed name.

### Changed

- Convert "Go to previous post" button into link.
- Renamed "Add feed" button to "Create feed".
- Renamed "View replies" link to "View conversation".
- Moved "Delete feed" button to feed configuration page.
- Updated translations ([#47](https://codeberg.org/silverpill/mitra-web/pulls/47)).

### Fixed

- Fixed broken links on "Ethereum" page.
- Removed vue-i18n scope warnings.

## [3.5.0] - 2024-09-17

### Added

- Support custom content warning images.
- Implemented custom feeds.

### Changed

- Updated translations ([#42](https://codeberg.org/silverpill/mitra-web/pulls/42), [#43](https://codeberg.org/silverpill/mitra-web/pulls/43)).
- Add space between paragraphs in bio.
- Changed bookmark pagination mechanism.
- Add empty space under "Show more profiles" button in follower list.
- Changed  "muted accounts" to "muted users".
- Display "No posts found" message if tag timeline is empty.
- Add `target=_blank` to external links in post content.

### Removed

- Drop support for notifications with `reply` type.

## [3.4.0] - 2024-09-04

### Added

- Define CSS variables for landing page customization.
- Attempt to load custom stylesheet when loading app.
- Support notifications with `subscriber_leaving` type.
- Added Russian translation ([#40](https://codeberg.org/silverpill/mitra-web/pulls/40)).

### Changed

- Use `Status.url` when copying link to post.
- Adjusted icon line width.
- Updated translations ([#40](https://codeberg.org/silverpill/mitra-web/pulls/40), [#41](https://codeberg.org/silverpill/mitra-web/pulls/41)).

### Fixed

- Don't delete auth token on connection errors.

## [3.3.0] - 2024-08-28

### Added

- Render custom emojis in profile bio.
- Added unicode emojis to emoji picker.
- Implement bookmarking.

### Changed

- Updated translations ([#38](https://codeberg.org/silverpill/mitra-web/pulls/38)).
- Ignore empty banner image.
- Display `mention` notification with `reply` subtype as reply notification.

### Fixed

- Translate stats in profile card.
- Fix translation error on subscription page.

## [3.2.0] - 2024-08-18

### Added

- Added pagination to search results.
- Display emoji reactions under post.
- Added picker for emoji reactions.
- Added list of muted accounts.
- Display "Post is not available" when post in thread is by muted user.

### Changed

- Updated translations ([#35](https://codeberg.org/silverpill/mitra-web/pulls/35), [#37](https://codeberg.org/silverpill/mitra-web/pulls/37)).
- Changed order of items in profile menu.

### Fixed

- Removed empty Korean translation file.

## [3.1.0] - 2024-08-08

### Changed

- Prepare more strings for translation.
- Updated translations ([#34](https://codeberg.org/silverpill/mitra-web/pulls/34)).

### Fixed

- Adjust height of "bio" field in profile form.

## [3.0.0] - 2024-07-22

### Changed

- Change minimum supported NodeJS version to 18.
- Remove dns.setDefaultResultOrder call from Vite config

### Removed

- Removed Ethereum subscriptions.

## [2.26.0] - 2024-07-20

### Added

- Display indicator when post author is muted.

### Changed

- Update post timestamp in real time.
- Use Pleroma Quote API to create reposts with comments.

### Fixed

- Don't remove profile image when pressing Enter in profile form.

## [2.25.0] - 2024-07-10

### Added

- Added new translations ([#24](https://codeberg.org/silverpill/mitra-web/pulls/24), [#25](https://codeberg.org/silverpill/mitra-web/pulls/25), [#27](https://codeberg.org/silverpill/mitra-web/pulls/27), [#28](https://codeberg.org/silverpill/mitra-web/pulls/28), [#29](https://codeberg.org/silverpill/mitra-web/pulls/29)).
- Added "Load replies" action to post menu.

### Changed

- Insert mention at the beginning of quote post.
- Don't insert mention when quoting one's own post.
- Insert whitespace after inserting mentions in reply or quote post.
- Use actor ID to generate blockicon.
- Move language selector to "Appearance" section of Settings page.
- Enable pluralization of post timestamps.

### Fixed

- Fixed background color of search input in webkit browsers.
- Prevent redirect to landing when loading local timeline as guest.

## [2.24.0] - 2024-06-30

### Added

- Added Dutch translation ([#22](https://codeberg.org/silverpill/mitra-web/pulls/22)).

### Changed

- Hide reposts from "Posts and Replies" tab.

### Fixed

- Use ellipsis character in search box.

## [2.23.0] - 2024-06-23

### Added

- Begin internationalization.

### Changed

- Prefer system UI fonts.

### Fixed

- Hide "Repost with comment" menu item if post is not public.

## [2.22.0] - 2024-06-15

### Added

- Added zoom-in effect to images in custom emoji notifications.

### Changed

- Display error message if attachment upload fails with code `413 Request Entity Too Large`.

### Removed

- Removed EIP-191 activity signing.

### Fixed

- Don't save drafts when editing post.

## [2.21.0] - 2024-06-01

### Changed

- Hide signature field in Monero login form if address field is empty.

### Fixed

- Fixed missing description in emoji reaction notification.

## [2.20.0] - 2024-05-28

### Added

- Added "Move followers" page.

### Changed

- Support `pleroma:emoji_reaction` notification type.
- Added explanatory text to "Identities" page.

### Fixed

- Prevent sidebar from overlapping with header.

## [2.19.0] - 2024-05-22

### Changed

- Rename "Move followers" to "Import followers".
- Add padding to nested lists.

### Fixed

- Fix alignment of unicode emojis in emoji reaction notifications.
- Fix hiding of mention suggestions in preview mode.

## [2.18.0] - 2024-05-07

### Added

- Implement notification grouping.

### Changed

- Disable next page button in notification list during loading.

### Fixed

- Don't build cryptocurrency icons as separate modules.

## [2.17.1] - 2024-04-29

### Changed

- Hide mention suggestions in preview mode.

### Fixed

- Fix bio field update bug in profile form.

## [2.17.0] - 2024-04-27

### Added

- Added "Remove from followers" item to profile menu.
- Added loading indicator to notification list.

### Changed

- Add tooltip to display name in post block.
- Use internal links in post block when user is logged in.
- Add whitespace when inserting custom emoji.
- Change quote background color on hover.

### Fixed

- Don't hide extra field removal button if device does not support hover.

## [2.16.0] - 2024-04-16

### Added

- Added "Load latest posts" to proile menu (only for admins).

### Changed

- Display error if username in login form contains invalid characters.
- Scroll to the top of notification list after navigation.

### Removed

- Removed "Manage subscriptions" item from profile menu.

### Fixed

- Added space between posts in search results.
- Update search results when post is deleted.
- Fixed text overflow in follower list.

## [2.15.1] - 2024-04-09

### Fixed

- Don't publish post if Enter is pressed in emoji search box.
- Display lightbox above sidebar.

## [2.15.0] - 2024-04-07

### Added

- Added emoji picker to post editor.
- Added "Subscriber details" page.
- Allow to add subscribers and extend existing subscriptions.

### Changed

- Added tooltips to actor handles.
- Explain "Accept mentions from" setting.

### Fixed

- Make notification counter visible on small screens.
- Fix incorrect position of follower stats.

## [2.14.0] - 2024-03-30

### Added

- Add ID-based route for gallery.
- Added support for actors without webfinger address.
- Added "Delete account" button to settings page.

### Changed

- Display handle with '@' in account link tooltips.
- Change tooltip text on "Like" and "Repost" buttons after completing action.
- Inline all SVG icons.

### Removed

- Removed NFT support.

### Fixed

- Don't allow profile image upload if media type is not supported.
- Fixed position of extra field removal button in profile form.
- Fixed authentication error occurring after logging out.

## [2.13.0] - 2024-03-12

### Added

- Add option to disable sending with Ctrl-Enter.
- Display notifications with `emoji_reaction` type.

### Changed

- Disable sending with Ctrl-Enter by default.
- Add alt text to attached images in post editor.
- Inline cryptocurrency SVG icons.

### Fixed

- Preserve aspect ratio of custom emojis.

## [2.12.0] - 2024-02-26

### Added

- Support "People I follow and my followers" mention policy.
- Add "Mute author" to post dropdown menu at tag timeline, notification list and in thread view.

### Changed

- Make `Account.mention_policy` field non-nullable.
- Inline some SVG icons.
- Rename "Only known users" mention policy to "Everybody except new accounts".
- Display "Unmute author" menu item when post author is muted.

### Fixed

- Fix lock icon color on Follow button.

## [2.11.0] - 2024-02-20

### Added

- Display federated timeline to all users unless `federated_timeline_restricted` is set to `true`.
- Allow to choose from whom to accept mentions.

### Changed

- Detect hashtags marked by rel=tag in post content.
- Use textarea for editing image descriptions.

## [2.10.0] - 2024-02-17

### Added

- Display "Automated" badge if account is a bot.
- Allow editing image descriptions.

### Changed

- Changed arrow shape on landing page.
- Inline SVGs on landing page.
- Stop using `/api/v1/accounts/search_public` API endpoint.

### Fixed

- Restore attachments after cancelling post update.

## [2.9.0] - 2024-02-07

### Added

- Add loader to profile directory page.
- Suggest re-verification if identity proof is outdated.
- Add "Federated" timeline.
- Display "Admin" badge if logged in user is admin.
- Support sign-up notifications.
- Add "Mute author" to post dropdown menu at local and network timelines.

### Changed

- Redirect unauthanticated users from local timeline to landing page if timeline is locked.
- Convert instance name in welcome text into About page link.

### Removed

- Remove pre-FEP-0837 remote subscription previews.

### Fixed

- Don't reload notification list after navigating to notifications page.

## [2.8.0] - 2024-01-29

### Added

- Add ⚡ to the list of supported Bitcoin Lightning labels.
- Disable follow, unfollow, like and repost buttons while request is being processed.

### Fixed

- Remove "Follow" button from user's own profile page.
- Fix duplicate mentions in post subheader.

## [2.7.0] - 2024-01-12

### Added

- Add "Copy actor ID" menu item to profile menu (only for admins).
- Display reply indicator when replying to one's own post.
- Add "Hide image" button to images with content warning.
- Show lightbox when clicking on image attachment.
- Added alt text to attached images.
- Added "Repost with comment" to post menu.

### Changed

- Add loader to tag timeline.
- Change representation of an attachment of unknown type.
- Allow interactions with images in Gallery.

### Fixed

- Fix alignment of "Copy link to post" menu item.

## [2.6.0] - 2023-12-25

### Added

- Display "Follow" button to guests.
- Make background color of public About page customizable.
- Enable detection of preferred color scheme on About page.

### Changed

- Make multiple requests when refreshing follower status.

### Fixed

- Fix incorrect admin avatar size on About page.

## [2.5.0] - 2023-12-14

### Changed

- Display broken mentions as external links.

## [2.4.0] - 2023-11-16

### Added

- Update follower status automatically after following remote profile.

### Changed

- Use invoice creation date as a starting date for Monero Payment Request.

## [2.3.0] - 2023-11-07

### Added

- Display donation button if profile has LN address.
- Implement Monero Payment Requests.
- Allow to remove profile images.

### Changed

- Use single API call to identify payment sender.
- Migrate build system to Vite 3.
- Use different color when rendering external links.

### Fixed

- Display "Mute author" menu item if post is reposted.
- Fix position of "Show more profiles" button on profile directory page.

## [2.2.0] - 2023-10-22

### Added

- Add "Cancel" button to comment form.
- Allow users to edit their posts.

### Changed

- Convert "Copy link to post" button to a link.
- Unlock next page button on home timeline in case of error.
- Remove extra whitespace in posts without text.
- Remove extra whitespace around "Publish" button.
- Move preview button to the right of character counter.
- Display character counter only when less than 100 characters left.

### Fixed

- Hide payment description if recipient is remote account.
- Prevent sidebar from obscuring header.
- Fix router link on profile page.
- Fix incorrect remote subscription status.

## [2.1.0] - 2023-10-10

### Added

- Add "Copy link to post" item to post menu.
- Fetch subscriber profile when performing identification on Monero subscription page.

### Changed

- Increase gap between icon and text in post menu.
- Remove whitespace from entered alias in "Add alias" form.

### Fixed

- Fix vertical position of dropdown menus.
- Fix timeline loading error when post list is empty.
- Ignore cached invoice if sender or recipient differ from selected ones.

## [2.0.0] - 2023-10-02

### Removed

- Drop support for `PORT` environment variable.
- Drop support for `VUE_APP_BACKEND_URL` environment variable.

## [1.36.1] - 2023-09-28

### Added

- Add "Explore" link to landing page is local timeline is accessible to guests.

## [1.36.0] - 2023-09-19

### Added

- Enable payments to remote recipients.
- Submit post form on Ctrl+Enter.
- Make local timeline page accessible to guests.

### Changed

- Send signed activities to outbox.

## [1.35.0] - 2023-09-11

### Added

- Added "Mute author" to post dropdown menu.
- Added OpenGraph image.

### Changed

- Ignore response body of `/api/v1/accounts/send_activity` endpoint.
- Improve Monero wallet login form.

### Fixed

- Fix post dropdown menu styles.

## [1.34.0] - 2023-08-31

### Added

- Display follow request notifications.
- Display "No posts found" label when profile timeline is empty.
- Add "Lock account" checkbox to profile form.
- Implement follow request review process.

### Changed

- Changed style of "not found" messages.
- Add FEP-8b32 integrity proof to C2S activities.
- Don't send `params` parameter to `/api/v1/accounts/send_activity` endpoint.

### Fixed

- Fix test overflow in action element.
- Fix incorrect notification count after deletion of a post.

## [1.33.1] - 2023-08-20

### Fixed

- Fix button text alignment on landing page.

## [1.33.0] - 2023-08-17

### Changed

- Always verify status code of HTTP responses.

### Fixed

- Make dropdown menu items fully clickable.
- Prevent auto-suggestions from appearing on reply form opening.

## [1.32.0] - 2023-08-10

### Added

- Show admin contact on "About" page.
- Display a message when gallery is empty.
- Preview remote subscription options.

### Changed

- Increase size of headings on "About" page.

### Fixed

- Fix text overflow on "About" page.

## [1.31.1] - 2023-07-30

### Fixed

- Add `.m4v` extension to the list of supported media types.

## [1.31.0] - 2023-07-26

### Added

- Use new minisign identity proof generation algorithm.
- Redesign minisign identity proof generation page.
- Added gallery page.

### Changed

- Changed license ID to `AGPL-3.0-only`.
- Added canonicalization step to activity signing procedure.

### Fixed

- Prevent "Back" button from occluding post title on token page.

## [1.30.0] - 2023-07-18

### Fixed

- Fix position of list markers.

## [1.29.0] - 2023-07-05

### Added

- Display welcome message to new users.
- Display subscription expiration dates in subscriber list.

### Changed

- Make identity proof submission work with new API.
- Send chain ID to server when updating subscription parameters.

## [1.28.0] - 2023-06-26

### Added

- Featured posts.

### Changed

- Display error messages on minisign identity verification page.

### Fixed

- Fixed pagination button bug on profile page.

## [1.27.0] - 2023-06-13

### Added

- Added manifest.json and multi-resolution icons ([#10](https://codeberg.org/silverpill/mitra-web/pulls/10)).

### Changed

- Enlarge custom emojis without moving surrounding text.

### Fixed

- Fix emoji shortcode replacement regex.
- Fix mention auto-suggestion not working when domain part is present.

## [1.26.0] - 2023-06-04

### Added

- Display Mitra logo in favicon.
- Show loader when paying is being processed.

### Changed

- Make custom background visible in header.
- Update payment page to handle "completed" and "failed" invoice statuses.

### Fixed

- Fix indentation of list items in profile bio.
- Fix text overflow in avatar image upload input.

## [1.25.0] - 2023-05-25

### Added

- Show unresolved aliases on "Aliases" page.
- Add button for removing declared aliases.
- Allow to edit payment amount on subscription page.
- Show error message if invoice status is "underpaid".
- Auto-suggest mentions in post editor.

### Changed

- Update local timeline page to work with new API.
- Implement error handling for "add alias" operation.
- Rename "Aliases" page to "Identities".
- Send Monero chain ID when creating invoice.
- Set minimum payment amount to 0.001 XMR.

## [1.24.1] - 2023-05-15

### Fixed

- Fixed broken subscription detection when accessing subscription page as guest.
- Don't display subscribers with expired subscriptions in subscriber list.

## [1.24.0] - 2023-05-14

### Added

- Add subscription button to donation widget.
- Added SCSS variable for background image for easier customization.
- Allow to cancel payment.
- Show currency description on payment page (if available).

### Changed

- Changed build target to `es2015`.
- Build project with Vite instead of Vue CLI.
- Show donation buttons in the same order as profile fields.
- Scroll to the top when reloading home timeline.

### Fixed

- Show subscription button if blockchain integration is disabled.
- Don't show "Mute" action on user's own profile page.

### Deprecated

- `VUE_APP_BACKEND_URL` and `PORT` environment variables (replaced with `VITE_BACKEND_URL` and `VITE_PORT`).

## [1.23.0] - 2023-05-03

### Added

- Don't show disabled login options.
- Add option to disable content warnings.
- Support "Sign In With Monero".
- Added "Mute" and "Unmute" actions to profile menu ([#7](https://codeberg.org/silverpill/mitra-web/pulls/7)).

### Changed

- Use checkbox input to switch theme.

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
