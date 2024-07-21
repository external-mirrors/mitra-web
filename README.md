# Mitra Web

Default frontend for [Mitra](https://codeberg.org/silverpill/mitra).

<img width="650" src="screenshot.png" alt="screenshot">

Mitra Web UI includes a dark mode feature for visual accessibility.

## Compatibility

The latest version of Mitra Web UI is compatible with the latest version of Mitra server and the version before it.

Compatibility with previous versions is not guaranteed.

## Requirements

- node 18+
- npm 7+

## Project setup

```
npm install --no-save
npx allow-scripts
```

### Compile and minify for production

Set backend URL:

```
echo "VITE_BACKEND_URL=https://mydomain.tld" > .env.local
```

Or un-set it if both frontend and backend will run on the same URL:

```
echo "VITE_BACKEND_URL=" > .env.local
```

Compile:

```
npm run build
```

This will produce a static website in the `/dist` directory.

### Customization

Color scheme can be adjusted by changing variables in [src/styles/_theme.scss](./src/styles/_theme.scss). This file includes parameters of both light and dark modes.

Rebuild the application after making changes.

## Development

### Compiles and hot-reloads for development

```
npm start
```

### Run your unit tests

```
npm run test
```

### Lint files

```
npm run lint
```

## Localization

Messages are stored in [src/locales](./src/locales) and can be edited using [Weblate](https://translate.codeberg.org/projects/mitra-web/main/).
