import { ApiConfiguration, ApiProvider } from "./api"

export interface WebviewMessage {
	type:
		| "apiConfiguration"
		| "customInstructions"
		| "alwaysAllowReadOnly"
		| "webviewDidLaunch"
		| "newTask"
		| "askResponse"
		| "clearTask"
		| "didShowAnnouncement"
		| "selectImages"
		| "exportCurrentTask"
		| "showTaskWithId"
		| "deleteTaskWithId"
		| "exportTaskWithId"
		| "resetState"
		| "requestOllamaModels"
		| "openImage"
		| "openFile"
		| "openMention"
		| "clearSelectedPromptContent"  // Added the new action
	text?: string
	askResponse?: ClaudeAskResponse
	apiConfiguration?: ApiConfiguration
	images?: string[]
	bool?: boolean
}

export type ClaudeAskResponse = "yesButtonTapped" | "noButtonTapped" | "messageResponse"
