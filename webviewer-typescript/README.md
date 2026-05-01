# TypeScript PDF Viewer Sample (WebViewer)

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates how to integrate WebViewer into a **TypeScript** project using [Parcel](https://parceljs.org/) as the bundler. It shows how to write type-safe code against the WebViewer API using the bundled TypeScript definition file, giving you editor auto-complete and compile-time type checking.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

In order to set the license key, you will need to set the string in the WebViewer sample. One such way is by passing it into the constructor of the WebViewer: https://docs.apryse.com/documentation/web/faq/add-license/#passing-into-constructor

Follow the steps below to set the license key in this sample:

- Locate the index.ts file at /src/index.ts
- Replace 'Insert commercial license key here after purchase' with your license key
- Save the file

## Install

```shell
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-typescript
npm install
```

## Run

```shell
npm start
```

`npm start` automatically copies the required WebViewer static assets from the npm package into the `lib` folder at the project root, then launches the Parcel dev server. Open [http://localhost:1234](http://localhost:1234) in your browser to view the sample.

> **Note:** The `lib/` folder is generated at build time and is listed in `.gitignore`. You do not need to commit it. If you ever need to copy the assets manually without starting the dev server, run:
>
> ```shell
> npm run copy-webviewer
> ```

### Clearing the Parcel cache

If you see unexpected behaviour after upgrading dependencies, clear the Parcel build cache and restart:

```shell
rm -rf .parcel-cache
npm start
```

