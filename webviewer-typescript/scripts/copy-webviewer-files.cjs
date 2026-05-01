const fs = require('fs-extra');

/**
 * Copies WebViewer static assets from the npm package into the lib folder
 * at the project root so that Parcel can serve them at the /lib path.
 *
 * This is run automatically after each Parcel build via the
 * parcel-reporter-multiple-static-file-copier reporter configured in .parcelrc.
 * Run this script manually (npm run copy-webviewer) only if you need the assets
 * available before the first build.
 *
 * Learn more at https://docs.apryse.com/web/guides/get-started/copy-assets
 */

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './lib');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();
