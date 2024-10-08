import * as vscode from "vscode"
import { XamunDev } from "../core/XamunDev"
import { XamunDevProvider } from "../core/webview/XamunDevProvider"
import { ApiConfiguration } from "../shared/api"
import { XamunMessage } from "../shared/ExtensionMessage"
import { HistoryItem } from "../shared/HistoryItem"

export { XamunDev, XamunDevProvider }
export type { ApiConfiguration, XamunMessage, HistoryItem }

export interface XamunDevExtensionExports {
	createXamunDev: (
		provider: XamunDevProvider,
		apiConfiguration: ApiConfiguration,
		customInstructions?: string,
		alwaysAllowReadOnly?: boolean,
		task?: string,
		images?: string[],
		historyItem?: HistoryItem
	) => XamunDev
	createXamunDevProvider: (context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) => XamunDevProvider
}
