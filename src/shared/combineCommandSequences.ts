import { XamunMessage } from "./ExtensionMessage"

export function combineCommandSequences(messages: XamunMessage[]): XamunMessage[] {
	const combinedMessages: XamunMessage[] = []
	let currentCommandSequence: XamunMessage | null = null

	for (const message of messages) {
		if (message.type === "ask" && message.ask === "command") {
			currentCommandSequence = message
		} else if (message.type === "ask" && message.ask === "command_output" && currentCommandSequence) {
			currentCommandSequence.text += `\n${message.text}`
		} else {
			if (currentCommandSequence) {
				combinedMessages.push(currentCommandSequence)
				currentCommandSequence = null
			}
			combinedMessages.push(message)
		}
	}

	if (currentCommandSequence) {
		combinedMessages.push(currentCommandSequence)
	}

	return combinedMessages
}
