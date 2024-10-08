import { ApiConfiguration } from "./api"

export type XamunAsk =
	| "command"
	| "command_output"
	| "tool"
	| "followup"
	| "completion_result"
	| "resume_task"
	| "resume_completed_task"
	| "api_req_failed"
	| "mistake_limit_reached"

export type XamunSay =
	| "text"
	| "error"
	| "user_feedback"
	| "user_feedback_diff"
	| "api_req_started"
	| "api_req_finished"
	| "api_req_retried"
	| "completion_result"
	| "inspect_site_result"
	| "shell_integration_warning"

export type XamunMessage =
	| {
			ts: number
			type: "ask"
			ask: XamunAsk
			text?: string
	  }
	| {
			ts: number
			type: "say"
			say: XamunSay
			text?: string
			images?: string[]
	  }

export type XamunSayTool =
	| {
			tool: "editedExistingFile"
			path: string
			diff: string
	  }
	| {
			tool: "newFileCreated"
			path: string
			content: string
	  }
	| {
			tool: "readFile" | "listFilesRecursive" | "listFilesTopLevel" | "listCodeDefinitionNames" | "searchFiles"
			path: string
			content: string
	  }
	| {
			tool: "inspectSite"
			path: string
	  }

export type ExtensionMessage =
	| { type: "state"; state: any }
	| { type: "theme"; text: string }
	| { type: "text"; text: string }
	| { type: "selectedImages"; images: string[] }
	| { type: "ollamaModels"; models: string[] }
	| { type: "action"; action: "didBecomeVisible" | "chatButtonTapped" | "settingsButtonTapped" | "plusButtonTapped" | "historyButtonTapped" }
