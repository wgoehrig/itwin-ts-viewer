# Minimal Typescript Viewer Sample

## Running the Sample

1. From a terminal at any directory within the repo, execute "npm install".
2. Create a `.env` file at the root of this repo with the following contents:
    ```ini
    CLIENT_ID = ""
    SCOPES = "imodelaccess:read imodels:read realitydata:read"

    ITWIN_ID = ""
    IMODEL_ID = ""

    BING_KEY = ""
    ```
3. Add values to the keys in your .env file. If you do not already have an iTwin application client id, you can obtain one [here](https://developer.bentley.com/register/).

    Your client should include the following:
      - API Associations
        - Visualization - enable the `imodelaccess:read` scope
        - iModels - enable the `imodels:read` scope
        - Reality Data - enable the `realitydate:read` scope
      - Application type - SPA
      - Redirect URIs - http://localhost:3001/

3. From a terminal at any directory within the repo, execute "npm start". This will compile the application in watch mode and start an http server on port 3001.
4. Navigate to http://localhost:3001 in your browser

