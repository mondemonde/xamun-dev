import * as vscode from "vscode"
import { XamunDev } from "../XamunDev"
import { ApiProvider } from "../../shared/api"
import { ExtensionMessage } from "../../shared/ExtensionMessage"
import { WebviewMessage } from "../../shared/WebviewMessage"
import { findLast } from "../../utils/array"
import { getNonce } from "./getNonce"
import { getUri } from "./getUri"
import { selectImages } from "../../integrations/misc/process-images"
import { downloadTask } from "../../integrations/misc/export-markdown"
import * as path from "path"
import fs from "fs/promises"
import { HistoryItem } from "../../shared/HistoryItem"
import axios from "axios"
import { getTheme } from "../../integrations/theme/getTheme"
import { openFile, openImage } from "../../integrations/misc/open-file"
import WorkspaceTracker from "../../integrations/workspace/WorkspaceTracker"
import { openMention } from "../mentions"

type SecretKey =
	| "apiKey"
	| "openRouterApiKey"
	| "awsAccessKey"
	| "awsSecretKey"
	| "awsSessionToken"
	| "openAiApiKey"
	| "geminiApiKey"
	| "openAiNativeApiKey"
type GlobalStateKey =
	| "apiProvider"
	| "apiModelId"
	| "awsRegion"
	| "vertexProjectId"
	| "vertexRegion"
	| "lastShownAnnouncementId"
	| "customInstructions"
	| "alwaysAllowReadOnly"
	| "taskHistory"
	| "openAiBaseUrl"
	| "openAiModelId"
	| "ollamaModelId"
	| "ollamaBaseUrl"
	| "anthropicBaseUrl"
	| "azureApiVersion"

export class XamunDevProvider implements vscode.WebviewViewProvider {
	public static readonly sideBarId = "xamun-dev.SidebarProvider"
	public static readonly tabPanelId = "xamun-dev.TabPanelProvider"
	private static activeInstances: Set<XamunDevProvider> = new Set()
	private disposables: vscode.Disposable[] = []
	private view?: vscode.WebviewView | vscode.WebviewPanel
	private xamunDev?: XamunDev
	private workspaceTracker?: WorkspaceTracker
	private latestAnnouncementId = "sep-21-2024"

	constructor(readonly context: vscode.ExtensionContext, private readonly outputChannel: vscode.OutputChannel) {
		this.outputChannel.appendLine("XamunDevProvider instantiated")
		XamunDevProvider.activeInstances.add(this)
		this.workspaceTracker = new WorkspaceTracker(this)
	}

	resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel): void | Thenable<void> {
		this.view = webviewView

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		}
		webviewView.webview.html = this.getHtmlContent(webviewView.webview)

		this.setWebviewMessageListener(webviewView.webview)

		// ... (keep other initialization logic)
	}

	async postMessageToWebview(message: ExtensionMessage) {
		await this.view?.webview.postMessage(message)
	}

	private setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(
			async (message: WebviewMessage) => {
				switch (message.type) {
					case "apiConfiguration":
						if (message.apiConfiguration) {
							const { apiKey } = message.apiConfiguration;
							if (apiKey) {
								await this.storeSecret("apiKey", apiKey);
								this.xamunDev?.updateApi({
									apiProvider: "anthropic",
									apiModelId: "claude-3-sonnet-20240229",
									apiKey,
								});
							}
						}
						await this.postStateToWebview();
						break;
					// ... (add other case statements as needed)
					default:
						console.log(`Unhandled message type: ${message.type}`);
				}
			},
			null,
			this.disposables
		)
	}

	private getHtmlContent(webview: vscode.Webview): string {
		// Implement the actual HTML content generation here
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Xamun Dev</title>
		</head>
		<body>
			<div id="root"></div>
			<script>
				// Add your webview-side JavaScript here
			</script>
		</body>
		</html>`;
	}

	private async storeSecret(key: string, value: string) {
		await this.context.secrets.store(key, value);
	}

	async postStateToWebview() {
		const state = await this.getStateToPostToWebview()
		await this.view?.webview.postMessage({ type: "state", state })
	}

	private async getStateToPostToWebview() {
		// Implement this method to return the current state
		return {
			// Add state properties here
		};
	}

	// ... (keep other necessary methods)
}