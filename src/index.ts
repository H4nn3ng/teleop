import { ExtensionContext } from "@foxglove/studio";

import { activate as activateMapPanel } from "./MapPanel";

export function activate(extensionContext: ExtensionContext): void {
  activateMapPanel(extensionContext);
}

// import { ExtensionContext } from "@foxglove/studio";
// import { initExamplePanel } from "./ExamplePanel";

// export function activate(extensionContext: ExtensionContext): void {
//   extensionContext.registerPanel({ name: "example-panel", initPanel: initExamplePanel });
// }
