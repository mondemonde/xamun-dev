import { XamunMessage } from "./ExtensionMessage"

export function combineApiRequests(messages: XamunMessage[]): XamunMessage[] {
	const combinedMessages: XamunMessage[] = []
	let currentApiRequest: XamunMessage | null = null

	for (const message of messages) {
		if (message.type === "say" && message.say === "api_req_started") {
			currentApiRequest = message
		} else if (message.type === "say" && message.say === "api_req_finished" && currentApiRequest) {
			currentApiRequest.text += `\n${message.text}`
			combinedMessages.push(currentApiRequest)
			currentApiRequest = null
		} else if (currentApiRequest === null) {
			combinedMessages.push(message)
		}
	}

	if (currentApiRequest) {
		combinedMessages.push(currentApiRequest)
	}

	return combinedMessages
}
