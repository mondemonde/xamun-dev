import React from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { getLanguageFromPath } from "../../utils/getLanguageFromPath"

interface CodeBlockProps {
	code: string
	language?: string
	path?: string
	isInline?: boolean
}

export const CODE_BLOCK_BG_COLOR = "var(--vscode-textCodeBlock-background)"

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, path, isInline }) => {
	const { theme } = useExtensionState()

	// TODO: Install highlight.js and implement syntax highlighting
	// For now, we'll just display the code without highlighting

	const lang = language || (path ? getLanguageFromPath(path) : "")

	if (isInline) {
		return (
			<code
				className={`language-${lang}`}
				style={{
					backgroundColor: CODE_BLOCK_BG_COLOR,
					padding: "0.1em 0.2em",
					borderRadius: "0.2em",
				}}
			>
				{code}
			</code>
		)
	}

	return (
		<pre
			style={{
				backgroundColor: CODE_BLOCK_BG_COLOR,
				padding: "1em",
				borderRadius: "0.3em",
				overflow: "auto",
			}}>
			<code className={`language-${lang}`}>{code}</code>
		</pre>
	)
}

export default CodeBlock
