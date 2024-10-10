import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import { ClaudeMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import Thumbnails from "../common/Thumbnails"
import { mentionRegexGlobal } from "../../../../src/shared/context-mentions"

interface TaskHeaderProps {
	task: ClaudeMessage
	tokensIn: number
	tokensOut: number
	doesModelSupportPromptCache: boolean
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	dailyTotalCost: number
	onClose: () => void
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
	task,
	tokensIn,
	tokensOut,
	doesModelSupportPromptCache,
	cacheWrites,
	cacheReads,
	totalCost,
	dailyTotalCost,
	onClose,
}) => {
	const { apiConfiguration } = useExtensionState()
	const [isTaskExpanded, setIsTaskExpanded] = useState(true)
	const [isTextExpanded, setIsTextExpanded] = useState(false)
	const [showSeeMore, setShowSeeMore] = useState(false)
	const textContainerRef = useRef<HTMLDivElement>(null)
	const textRef = useRef<HTMLDivElement>(null)

	const { height: windowHeight, width: windowWidth } = useWindowSize()

	useEffect(() => {
		if (isTextExpanded && textContainerRef.current) {
			const maxHeight = windowHeight * (1 / 2)
			textContainerRef.current.style.maxHeight = `${maxHeight}px`
		}
	}, [isTextExpanded, windowHeight])

	useEffect(() => {
		if (textRef.current && textContainerRef.current) {
			let textContainerHeight = textContainerRef.current.clientHeight
			if (!textContainerHeight) {
				textContainerHeight = textContainerRef.current.getBoundingClientRect().height
			}
			const isOverflowing = textRef.current.scrollHeight > textContainerHeight
			if (!isOverflowing) {
				setIsTextExpanded(false)
			}
			setShowSeeMore(isOverflowing)
		}
	}, [task.text, windowWidth])

	const isCostAvailable = useMemo(() => {
		return (
			apiConfiguration?.apiProvider !== "openai" &&
			apiConfiguration?.apiProvider !== "ollama" &&
			apiConfiguration?.apiProvider !== "gemini"
		)
	}, [apiConfiguration?.apiProvider])

	const shouldShowPromptCacheInfo = doesModelSupportPromptCache && apiConfiguration?.apiProvider !== "openrouter"

	return (
		<div style={{ padding: "10px 13px 10px 13px" }}>
			<div
				style={{
					backgroundColor: "var(--vscode-badge-background)",
					color: "var(--vscode-badge-foreground)",
					borderRadius: "3px",
					padding: "9px 10px 9px 14px",
					display: "flex",
					flexDirection: "column",
					gap: 6,
					position: "relative",
					zIndex: 1,
				}}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							marginLeft: -2,
							userSelect: "none",
							WebkitUserSelect: "none",
							MozUserSelect: "none",
							msUserSelect: "none",
							flexGrow: 1,
							minWidth: 0,
						}}
						onClick={() => setIsTaskExpanded(!isTaskExpanded)}>
						<div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
							<span className={`codicon codicon-chevron-${isTaskExpanded ? "down" : "right"}`}></span>
						</div>
						<div
							style={{
								marginLeft: 6,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								flexGrow: 1,
								minWidth: 0,
							}}>
							<span style={{ fontWeight: "bold" }}>Task{!isTaskExpanded && ":"}</span>
							{!isTaskExpanded && (
								<span style={{ marginLeft: 4 }}>{highlightMentions(task.text, false)}</span>
							)}
						</div>
					</div>
					{!isTaskExpanded && isCostAvailable && (
						<div
							style={{
								marginLeft: 10,
								backgroundColor: "color-mix(in srgb, var(--vscode-badge-foreground) 70%, transparent)",
								color: "var(--vscode-badge-background)",
								padding: "2px 4px",
								borderRadius: "500px",
								fontSize: "11px",
								fontWeight: 500,
								display: "inline-block",
								flexShrink: 0,
							}}>
							${totalCost?.toFixed(4)}
						</div>
					)}
					<VSCodeButton appearance="icon" onClick={onClose} style={{ marginLeft: 6, flexShrink: 0 }}>
						<span className="codicon codicon-close"></span>
					</VSCodeButton>
				</div>
				{isTaskExpanded && (
					<>
						<div
							ref={textContainerRef}
							style={{
								marginTop: -2,
								fontSize: "var(--vscode-font-size)",
								overflowY: isTextExpanded ? "auto" : "hidden",
								wordBreak: "break-word",
								overflowWrap: "anywhere",
								position: "relative",
							}}>
							<div
								ref={textRef}
								style={{
									display: "-webkit-box",
									WebkitLineClamp: isTextExpanded ? "unset" : 3,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
									overflowWrap: "anywhere",
								}}>
								{highlightMentions(task.text, false)}
							</div>
							{!isTextExpanded && showSeeMore && (
								<div
									style={{
										position: "absolute",
										right: 0,
										bottom: 0,
										display: "flex",
										alignItems: "center",
									}}>
									<div
										style={{
											width: 30,
											height: "1.2em",
											background:
												"linear-gradient(to right, transparent, var(--vscode-badge-background))",
										}}
									/>
									<div
										style={{
											cursor: "pointer",
											color: "var(--vscode-textLink-foreground)",
											paddingRight: 0,
											paddingLeft: 3,
											backgroundColor: "var(--vscode-badge-background)",
										}}
										onClick={() => setIsTextExpanded(!isTextExpanded)}>
										See more
									</div>
								</div>
							)}
						</div>
						{isTextExpanded && showSeeMore && (
							<div
								style={{
									cursor: "pointer",
									color: "var(--vscode-textLink-foreground)",
									marginLeft: "auto",
									textAlign: "right",
									paddingRight: 2,
								}}
								onClick={() => setIsTextExpanded(!isTextExpanded)}>
								See less
							</div>
						)}
						{task.images && task.images.length > 0 && <Thumbnails images={task.images} />}
						<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}>
								<div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
									<span style={{ fontWeight: "bold" }}>Tokens:</span>
									<span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
										<i
											className="codicon codicon-arrow-up"
											style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-2px" }}
										/>
										{tokensIn?.toLocaleString()}
									</span>
									<span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
										<i
											className="codicon codicon-arrow-down"
											style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-2px" }}
										/>
										{tokensOut?.toLocaleString()}
									</span>
								</div>
								{!isCostAvailable && <ExportButton />}
							</div>

							{(shouldShowPromptCacheInfo || cacheReads !== undefined || cacheWrites !== undefined) && (
								<div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
									<span style={{ fontWeight: "bold" }}>Cache:</span>
									<span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
										<i
											className="codicon codicon-database"
											style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-1px" }}
										/>
										+{(cacheWrites || 0)?.toLocaleString()}
									</span>
									<span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
										<i
											className="codicon codicon-arrow-right"
											style={{ fontSize: "12px", fontWeight: "bold", marginBottom: 0 }}
										/>
										{(cacheReads || 0)?.toLocaleString()}
									</span>
								</div>
							)}
							{isCostAvailable && (
								<>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
											<span style={{ fontWeight: "bold" }}>API Cost:</span>
											<span>${totalCost?.toFixed(4)}</span>
										</div>
										<ExportButton />
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
											<span style={{ fontWeight: "bold" }}>Daily Total Cost:</span>
											<span>${dailyTotalCost?.toFixed(4)}</span>
										</div>
									</div>
								</>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export const highlightMentions = (text?: string, withShadow = true) => {
	if (!text) return text
	const parts = text.split(mentionRegexGlobal)
	return parts.map((part, index) => {
		if (index % 2 === 0) {
			return part
		} else {
			return (
				<span
					key={index}
					className={withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"}
					style={{ cursor: "pointer" }}
					onClick={() => vscode.postMessage({ type: "openMention", text: part })}>
					@{part}
				</span>
			)
		}
	})
}

const ExportButton = () => (
	<VSCodeButton
		appearance="icon"
		onClick={() => vscode.postMessage({ type: "exportCurrentTask" })}
		style={{}}>
		<div style={{ fontSize: "10.5px", fontWeight: "bold", opacity: 0.6 }}>EXPORT</div>
	</VSCodeButton>
)

export default memo(TaskHeader)
