import { ApiConfiguration } from "./api"

export type XamunAskResponse = "yesButtonTapped" | "noButtonTapped" | "messageResponse"

export type WebviewMessage =
	| { type: "webviewDidLaunch" }
	| { type: "newTask"; text?: string; images?: string[] }
	| {
			type: "apiConfiguration"
			apiConfiguration?: ApiConfiguration
	  }
	| { type: "customInstructions"; text?: string }
	| { type: "alwaysAllowReadOnly"; bool?: boolean }
	| {
			type: "askResponse"
			askResponse: XamunAskResponse
			text?: string
			images?: string[]
	  }
	| { type: "clearTask" }
	| { type: "didShowAnnouncement" }
	| { type: "selectImages" }
	| { type: "exportCurrentTask" }
	| { type: "showTaskWithId"; text: string }
	| { type: "deleteTaskWithId"; text: string }
	| { type: "exportTaskWithId"; text: string }
	| { type: "resetState" }
	| { type: "requestOllamaModels"; text?: string }
	| { type: "openImage"; text: string }
	| { type: "openFile"; text: string }
	| { type: "openMention"; text?: string }
