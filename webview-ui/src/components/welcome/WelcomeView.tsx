import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "../settings/ApiOptions"

const WelcomeView = () => {
	const { apiConfiguration } = useExtensionState()

	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showWarning, setShowWarning] = useState(false)

	const handleSubmit = () => {
		if (!apiConfiguration?.apiKey) {
			setShowWarning(true)
		}
		vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
		setShowWarning(false)
	}, [apiConfiguration])

	return (
		<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, padding: "0 20px" }}>
			<h2>Hi, I'm Xamun Dev</h2>
			<p>
				I can do all kinds of tasks thanks to the latest breakthroughs in{" "}
				<VSCodeLink
					href="https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf"
					style={{ display: "inline" }}>
					Claude 3.5 Sonnet's agentic coding capabilities
				</VSCodeLink>{" "}
				and access to tools that let me create & edit files, explore complex projects, and execute terminal
				commands (with your permission, of course).
			</p>

			<b>To get started, this extension needs an API provider for Claude 3.5 Sonnet.</b>

			<div style={{ marginTop: "10px" }}>
				<ApiOptions showModelOptions={false} apiErrorMessage={apiErrorMessage} />
				{showWarning && !apiConfiguration?.apiKey && (
					<p style={{ color: "var(--vscode-warningForeground)", fontSize: "12px", marginTop: "5px" }}>
						Warning: No API key provided. Some features may not work without an API key.
					</p>
				)}
				<VSCodeButton onClick={handleSubmit} style={{ marginTop: "3px" }}>
					Let's go!
				</VSCodeButton>
			</div>
		</div>
	)
}

export default WelcomeView
