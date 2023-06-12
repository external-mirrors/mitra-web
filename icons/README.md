# Icons
When mitra is installed as a PWA, the host system can make use of these icons at will to represent the app. Available icons are communicated to the host OS via the `icons` section of the [manifest.json](../public/manifest.json) file. [As recommended](https://web.dev/learn/pwa/web-app-manifest/), mitra-web comes with a general use icon and a "maskable" icon, both in the recommended set of resolutions.

## Script
The [generate-scales.bash](./generate-scales.bash) script can be used to generate all desired resolutions of each icon and place them in the public/icons directory. Aside from generating the different resolution icon files, the script will also output json objects that can be copy-pasted into the manifest.json file as members of the `icons` array.
