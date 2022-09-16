# Typescript Viewer Sample

## Running the Sample

1. From a terminal at any directory within the repo, execute "rush install".
2. From a terminal at any directory within the repo, execute "rush build". This should only need to be done once to build both the app and the extension. This repo is currently not setup for a production build of the app, but the build script will ensure that extension is also compiled.
3. Make a copy of the config.json file in app/public and name it "config-local.json". Add values to the keys in your config.local.json file. At a minimum, all auth client information as well as an iTwinId and iModelId are required to run the application. If you do not already have an iTwin application client id, you can obtain one [here](https://developer.bentley.com/register/).

- Your client should include the following:
  - API Associations
    - Visualization - enable the `imodelaccess:read` scope
    - iModels - enable the `imodels:read` scope
    - Reality Data - enable the `realitydate:read` scope
  - Application type - SPA
  - Redirect URIs - http://localhost:3000

4. From a terminal at the root of the "app" directory, execute "npm start". This will compile the application in watch mode and start an http server on port 3000.
5. Navigate to http://localhost:3000 in your browser
