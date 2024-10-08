import React, { useState } from "react"
import CodeBlock, { CODE_BLOCK_BG_COLOR } from "./CodeBlock"

interface CodeAccordianProps {
	code: string
	language?: string
	path?: string
	title?: string
	isExpanded?: boolean
}

const CodeAccordian: React.FC<CodeAccordianProps> = ({ code, language, path, title, isExpanded = false }) => {
	const [expanded, setExpanded] = useState(isExpanded)

	const toggleExpanded = () => {
		setExpanded(!expanded)
	}

	return (
		<div
			style={{
				backgroundColor: CODE_BLOCK_BG_COLOR,
				borderRadius: "0.3em",
				marginBottom: "1em",
			}}>
			<div
				onClick={toggleExpanded}
				style={{
					padding: "0.5em 1em",
					cursor: "pointer",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}>
				<span>{title || (path ? path : "Code")}</span>
				<span>{expanded ? "▼" : "▶"}</span>
			</div>
			{expanded && (
				<CodeBlock
					code={code}
					language={language}
					path={path}
				/>
			)}
		</div>
	)
}

export default CodeAccordian
