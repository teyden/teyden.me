# variant-store-ui
The front-end source files here are processed and bundled using [webpack](https://webpack.js.org/). This gives us a few major benefits, including:

- The ability to `import` and use any package from the NPM ecosystem
- [JSX](https://facebook.github.io/jsx/) support
- ES6 (and beyond) support
- CSS preprocessor support

## How it works
The `src` directory contains all source files, including JS, CSS, and assets (images, etc.). Webpack processes and bundles those source files, producing files that are ready to be included directly by the browser. These are placed into the `dist` directory.

During a maven build, maven invokes webpack to generate the processed and bundled output files. Only the processed, bundled, and uglified files are included in the PhenoTips distribution.

## How to use it
**You'll work from the source directory in the repository, with webpack configured to output the processed files directly to the PhenoTips instance of your choice.**

1. Install NPM dependencies using [`yarn`](https://yarnpkg.com/en/) or [`npm`](https://docs.npmjs.com/cli/install) (`yarn` is recommended).

    ```shell
    yarn
    ```
    
2. Start webpack in dev mode, configured to output to the PhenoTips instance of your choice. In this mode, webpack will watch the files in the module, regenerating the output files when necessary. The output files will be placed directly into the appropriate directory on the running PhenoTips instance.

    ```shell
    yarn run dev -- --env.outputPath={path to variant store directory in your phenotips instance}
    # For example:
    yarn run dev -- --env.outputPath=/Users/daniel/phenotips-1.2.5/webapps/phenotips/resources/uicomponents/variant-store
    ```
    
3. Make your changes to the source files. After making a change to a file in `src`, you'll need to wait until webpack has regenerated the output (which happens almost immediately) and then refresh the browser window.
    
