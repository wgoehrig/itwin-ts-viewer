import { BrowserAuthorizationCallbackHandler, BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@itwin/core-common";
import { CheckpointConnection, IModelApp, ScreenViewport, ViewCreator3d } from "@itwin/core-frontend";
import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
import { IModelsClient } from "@itwin/imodels-client-management";
declare const ENV: any; // injected from .env

/** Setup auth and login */
const redirectUri = window.location.href;
await BrowserAuthorizationCallbackHandler.handleSigninCallback(redirectUri);
const authClient = new BrowserAuthorizationClient({ clientId: ENV.CLIENT_ID, scope: ENV.SCOPES, redirectUri, responseType: "code" });
await authClient.signIn()

/** Application initialization */
await IModelApp.startup({
  authorizationClient: authClient,
  hubAccess: new FrontendIModelsAccess(new IModelsClient()),
  mapLayerOptions: {
    BingMaps: { key: "key", value: ENV.BING_KEY },
  },
});

/** Setup iModel Access Service client */
const rpcConfig = { uriPrefix: "https://api.bentley.com", info: { title: "imodel/rpc", version: "" } };
BentleyCloudRpcManager.initializeClient(rpcConfig, [IModelReadRpcInterface, IModelTileRpcInterface]);

/** Connect to iModel Access Service */
const iModelConnection = await CheckpointConnection.openRemote(ENV.ITWIN_ID, ENV.IMODEL_ID);

/** Setup and add Viewport */
const viewCreator = new ViewCreator3d(iModelConnection);
const viewState = await viewCreator.createDefaultView({ skyboxOn: true });
const root = document.getElementById("root") as HTMLDivElement;
const vp = ScreenViewport.create(root, viewState);
IModelApp.viewManager.addViewport(vp);
