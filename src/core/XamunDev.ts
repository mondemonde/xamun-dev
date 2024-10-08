import { Anthropic } from "@anthropic-ai/sdk"
import delay from "delay"
import * as diff from "diff"
import fs from "fs/promises"
import os from "os"
import { SYSTEM_PROMPT } from "./prompts/system"
import pWaitFor from "p-wait-for"
import * as path from "path"
import { serializeError } from "serialize-error"
import * as vscode from "vscode"
import { ApiHandler, buildApiHandler } from "../api"
import { diagnosticsToProblemsString, getNewDiagnostics } from "../integrations/diagnostics"
import { formatContentBlockToMarkdown } from "../integrations/misc/export-markdown"
import { extractTextFromFile } from "../integrations/misc/extract-text"
import { TerminalManager } from "../integrations/terminal/TerminalManager"
import { UrlContentFetcher } from "../services/browser/UrlContentFetcher"
import { listFiles } from "../services/glob/list-files"
import { regexSearchFiles } from "../services/ripgrep"
import { parseSourceCodeForDefinitionsTopLevel } from "../services/tree-sitter"
import { ApiConfiguration } from "../shared/api"
import { combineApiRequests } from "../shared/combineApiRequests"
import { combineCommandSequences } from "../shared/combineCommandSequences"
import { XamunAsk, XamunMessage, XamunSay, XamunSayTool } from "../shared/ExtensionMessage"
import { getApiMetrics } from "../shared/getApiMetrics"
import { HistoryItem } from "../shared/HistoryItem"
import { ToolName } from "../shared/Tool"
import { XamunAskResponse } from "../shared/WebviewMessage"
import { findLast, findLastIndex } from "../utils/array"
import { arePathsEqual } from "../utils/path"
import { parseMentions } from "./mentions"
import { TOOLS } from "./prompts/tools"
import { truncateHalfConversation } from "./sliding-window"
import { XamunDevProvider } from "./webview/XamunDevProvider"

const cwd =
	vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).at(0) ?? path.join(os.homedir(), "Desktop")

type ToolResponse = string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>
type UserContent = Array<
	Anthropic.TextBlockParam | Anthropic.ImageBlockParam | Anthropic.ToolUseBlockParam | Anthropic.ToolResultBlockParam
>

export interface XamunRequestResult {
	didEndLoop: boolean;
	inputTokens: number;
	outputTokens: number;
}

export class XamunDev {
	readonly taskId: string
	private api: ApiHandler
	private terminalManager: TerminalManager
	private urlContentFetcher: UrlContentFetcher
	private didEditFile: boolean = false
	private customInstructions?: string
	private alwaysAllowReadOnly: boolean
	apiConversationHistory: Anthropic.MessageParam[] = []
	xamunMessages: XamunMessage[] = []
	private askResponse?: XamunAskResponse
	private askResponseText?: string
	private askResponseImages?: string[]
	private lastMessageTs?: number
	private consecutiveMistakeCount: number = 0
	private providerRef: WeakRef<XamunDevProvider>
	private abort: boolean = false

	constructor(
		provider: XamunDevProvider,
		apiConfiguration: ApiConfiguration,
		customInstructions?: string,
		alwaysAllowReadOnly?: boolean,
		task?: string,
		images?: string[],
		historyItem?: HistoryItem
	) {
		this.providerRef = new WeakRef(provider)
		this.api = buildApiHandler(apiConfiguration)
		this.terminalManager = new TerminalManager()
		this.urlContentFetcher = new UrlContentFetcher(provider.context)
		this.customInstructions = customInstructions
		this.alwaysAllowReadOnly = alwaysAllowReadOnly ?? false

		if (historyItem) {
			this.taskId = historyItem.id
			this.resumeTaskFromHistory(historyItem)
		} else if (task || images) {
			this.taskId = Date.now().toString()
			this.startTask(task, images)
		} else {
			throw new Error("Either historyItem or task/images must be provided")
		}
	}

	updateApi(apiConfiguration: ApiConfiguration) {
		this.api = buildApiHandler(apiConfiguration)
	}

	private async resumeTaskFromHistory(historyItem: HistoryItem) {
		// Implementation for resuming task from history
		// ... (implement this method)
	}

	private async startTask(task?: string, images?: string[]) {
		// Implementation for starting a new task
		// ... (implement this method)
	}

	// ... (rest of the class implementation)
}