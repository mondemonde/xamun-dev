import * as vscode from "vscode"
import { XamunDevProvider } from "../../core/webview/XamunDevProvider"
import { getPythonEnvironment } from "./get-python-env"

export default class WorkspaceTracker {
	private disposables: vscode.Disposable[] = []
	private workspaceFolders: string[] = []
	private pythonEnvironment: string | null = null

	constructor(private readonly provider: XamunDevProvider) {
		this.updateWorkspaceFolders()
		this.updatePythonEnvironment()

		this.disposables.push(
			vscode.workspace.onDidChangeWorkspaceFolders(() => {
				this.updateWorkspaceFolders()
				this.updatePythonEnvironment()
			})
		)
	}

	private updateWorkspaceFolders() {
		this.workspaceFolders = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? []
	}

	private async updatePythonEnvironment() {
		this.pythonEnvironment = await getPythonEnvironment()
	}

	public getWorkspaceFolders(): string[] {
		return this.workspaceFolders
	}

	public getPythonEnvironment(): string | null {
		return this.pythonEnvironment
	}

	dispose() {
		this.disposables.forEach((d) => d.dispose())
	}
}
