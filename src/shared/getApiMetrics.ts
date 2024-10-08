import { XamunMessage } from "./ExtensionMessage"

export function getApiMetrics(messages: XamunMessage[]): { inputTokens: number; outputTokens: number } {
	let inputTokens = 0
	let outputTokens = 0

	for (const message of messages) {
		if (message.type === "say" && message.say === "api_req_finished") {
			const match = message.text?.match(/Input tokens: (\d+), Output tokens: (\d+)/)
			if (match) {
				inputTokens += parseInt(match[1], 10)
				outputTokens += parseInt(match[2], 10)
			}
		}
	}

	return { inputTokens, outputTokens }
}
