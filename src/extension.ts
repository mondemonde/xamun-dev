// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { ClaudeDevProvider } from "./core/webview/ClaudeDevProvider"
import delay from "delay"
import { createClaudeDevAPI } from "./exports"
import "./utils/path" // necessary to have access to String.prototype.toPosix
import { exploreWithXamun } from "./commands/exploreWithXamun"

/*
Built using https://github.com/microsoft/vscode-webview-ui-toolkit

Inspired by
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra

*/

let outputChannel: vscode.OutputChannel

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("Claude Dev")
	context.subscriptions.push(outputChannel)

	outputChannel.appendLine("Xamun Dev extension activated")

	const sidebarProvider = new ClaudeDevProvider(context, outputChannel)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClaudeDevProvider.sideBarId, sidebarProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("xamun-dev.plusButtonTapped", async () => {
			outputChannel.appendLine("Plus button tapped")
			await sidebarProvider.clearTask()
			await sidebarProvider.postStateToWebview()
			await sidebarProvider.postMessageToWebview({ type: "action", action: "chatButtonTapped" })
		})
	)

	const openClaudeDevInNewTab = async (view: 'main' | 'promptLibrary' = 'main') => {
		outputChannel.appendLine(`Opening Xamun Dev ${view} view in new tab`)
		const tabProvider = new ClaudeDevProvider(context, outputChannel)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		// Check if there are any visible text editors, otherwise open a new group to the right
		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(ClaudeDevProvider.tabPanelId, "Xamun Dev", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "icons", "robot_panel_light.png"),
			dark: vscode.Uri.joinPath(context.extensionUri, "icons", "robot_panel_dark.png"),
		}
		tabProvider.resolveWebviewView(panel)

		// Open the specific view
		if (view === 'promptLibrary') {
			tabProvider.postMessageToWebview({ type: "action", action: "promptLibraryButtonTapped", isTab: true })
		}

		// Lock the editor group so clicking on files doesn't open them over the panel
		await delay(100)
		await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
	}

	context.subscriptions.push(vscode.commands.registerCommand("xamun-dev.popoutButtonTapped", () => openClaudeDevInNewTab('main')))
	context.subscriptions.push(vscode.commands.registerCommand("xamun-dev.openInNewTab", () => openClaudeDevInNewTab('main')))
	context.subscriptions.push(vscode.commands.registerCommand("xamun-dev.openPromptLibraryInNewTab", () => openClaudeDevInNewTab('promptLibrary')))

	context.subscriptions.push(
		vscode.commands.registerCommand("xamun-dev.settingsButtonTapped", () => {
			sidebarProvider.postMessageToWebview({ type: "action", action: "settingsButtonTapped" })
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("xamun-dev.historyButtonTapped", () => {
			sidebarProvider.postMessageToWebview({ type: "action", action: "historyButtonTapped" })
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("xamun-dev.promptLibraryButtonTapped", () => {
			sidebarProvider.postMessageToWebview({ type: "action", action: "promptLibraryButtonTapped", isTab: false })
		})
	)

	// Register the new "Explore with Xamun" command
	context.subscriptions.push(exploreWithXamun(context))

	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider("claude-dev-diff", diffContentProvider)
	)

	// URI Handler
	const handleUri = async (uri: vscode.Uri) => {
		const path = uri.path
		const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
		const visibleProvider = ClaudeDevProvider.getVisibleInstance()
		if (!visibleProvider) {
			return
		}
		switch (path) {
			case "/openrouter": {
				const code = query.get("code")
				if (code) {
					await visibleProvider.handleOpenRouterCallback(code)
				}
				break
			}
			default:
				break
		}
	}
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	return createClaudeDevAPI(outputChannel, sidebarProvider)
}

// This method is called when your extension is deactivated
export function deactivate() {
	outputChannel.appendLine("Claude Dev extension deactivated")
}
