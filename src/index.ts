import { BrowserAuthorizationCallbackHandler, BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@itwin/core-common";
import { CheckpointConnection, FitViewTool, IModelApp, ScreenViewport, StandardViewId, StandardViewTool, ViewCreator3d } from "@itwin/core-frontend";
import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
import { IModelsClient } from "@itwin/imodels-client-management";
declare const ENV: any; // injected from .env

const redirectUri = window.location.href;
await BrowserAuthorizationCallbackHandler.handleSigninCallback(redirectUri);
const authClient = new BrowserAuthorizationClient({ clientId: ENV.CLIENT_ID, scope: ENV.SCOPES, redirectUri });
await authClient.signIn()

await IModelApp.startup({
  authorizationClient: authClient,
  hubAccess: new FrontendIModelsAccess(new IModelsClient()),
  mapLayerOptions: {
    BingMaps: { key: "key", value: ENV.BING_KEY },
  },
});

const rpcConfig = { uriPrefix: "https://api.bentley.com", info: { title: "imodel/rpc", version: "" } };
BentleyCloudRpcManager.initializeClient(rpcConfig, [IModelReadRpcInterface, IModelTileRpcInterface]);

const iModelConnection = await CheckpointConnection.openRemote(ENV.ITWIN_ID, ENV.IMODEL_ID);

const viewCreator = new ViewCreator3d(iModelConnection);
const viewState = await viewCreator.createDefaultView({ skyboxOn: true });
const root = document.getElementById("root") as HTMLDivElement;
const vp = ScreenViewport.create(root, viewState);
IModelApp.viewManager.addViewport(vp);

IModelApp.tools.run(StandardViewTool.toolId, vp, StandardViewId.RightIso);
IModelApp.tools.run(FitViewTool.toolId, vp, true, false);