import { BrowserAuthorizationCallbackHandler, BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@itwin/core-common";
import { CheckpointConnection, FitViewTool, IModelApp, ScreenViewport, StandardViewId, StandardViewTool, ViewCreator3d } from "@itwin/core-frontend";
import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
import { IModelsClient } from "@itwin/imodels-client-management";
import { DefaultContentDisplayTypes, KeySet, PresentationRpcInterface } from "@itwin/presentation-common";
import { Presentation } from "@itwin/presentation-frontend";
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
BentleyCloudRpcManager.initializeClient(rpcConfig, [IModelReadRpcInterface, IModelTileRpcInterface, PresentationRpcInterface]);

/** Connect to iModel Access Service */
const iModelConnection = await CheckpointConnection.openRemote(ENV.ITWIN_ID, ENV.IMODEL_ID);

/** Setup and add Viewport */
const viewCreator = new ViewCreator3d(iModelConnection);
const viewState = await viewCreator.createDefaultView({ skyboxOn: true });
const root = document.getElementById("root") as HTMLDivElement;
const vp = ScreenViewport.create(root, viewState);
IModelApp.viewManager.addViewport(vp);

/** Rotate and fit view */
IModelApp.tools.run(StandardViewTool.toolId, vp, StandardViewId.RightIso);
IModelApp.tools.run(FitViewTool.toolId, vp, true, false);

/** Setup presentation and download rulesets */
await Presentation.initialize();
const modelsRuleset = await (await fetch("models.json")).json();
const propertiesRuleset = await (await fetch("propertygrid.json")).json();

/** Get the root nodes of the tree defined by "models.json" */
const hierarchyOpts = { imodel: iModelConnection, rulesetOrId: modelsRuleset };
const rootNodes = await Presentation.presentation.getNodes(hierarchyOpts);

/** Expand a few nodes in the tree until we hit a leaf and log everything to the console */
let nodes = rootNodes;
while (nodes.length > 0 && nodes[0].hasChildren) {
  const n = nodes[0];
  nodes = n["children"] = await Presentation.presentation.getNodes({ ...hierarchyOpts, parentKey: n.key });
}
console.log("TREE:", rootNodes);

/** Unified selection - synchronize viewport's selection w/ Presentation */
Presentation.selection.setSyncWithIModelToolSelection(iModelConnection, true);

/** Get and log PropertyPane data every time the selection changes */
Presentation.selection.selectionChange.addListener(async (ev) => {
  const opts = {
    imodel: iModelConnection,
    rulesetOrId: propertiesRuleset,
    keys: ev.keys as KeySet,
  };

  const displayType = DefaultContentDisplayTypes.PropertyPane;
  const descriptor = await Presentation.presentation.getContentDescriptor({ ...opts, displayType });
  console.log(descriptor && await Presentation.presentation.getContent({ ...opts, descriptor }));
});
