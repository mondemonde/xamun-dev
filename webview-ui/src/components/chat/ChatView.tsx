import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEvent, useMount } from "react-use"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import { ClaudeAsk, ClaudeSayTool, ExtensionMessage } from "../../../../src/shared/ExtensionMessage"
import { combineApiRequests } from "../../../../src/shared/combineApiRequests"
import { combineCommandSequences } from "../../../../src/shared/combineCommandSequences"
import { getApiMetrics } from "../../../../src/shared/getApiMetrics"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import Announcement from "./Announcement"
import { normalizeApiConfiguration } from "../settings/ApiOptions"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import HistoryPreview from "../history/HistoryPreview"
import TaskHeader from "./TaskHeader"

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	selectedPromptContent?: string
	clearSelectedPromptContent: () => void
}

export const MAX_IMAGES_PER_MESSAGE = 20 // Anthropic limits to 20 images

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView, selectedPromptContent, clearSelectedPromptContent }: ChatViewProps) => {
	const { version, claudeMessages: messages, taskHistory, apiConfiguration } = useExtensionState()

	const task = messages.length > 0 ? messages[0] : undefined
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const [inputValue, setInputValue] = useState("")
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const [textAreaDisabled, setTextAreaDisabled] = useState(false)
	const [selectedImages, setSelectedImages] = useState<string[]>([])

	const [claudeAsk, setClaudeAsk] = useState<ClaudeAsk | undefined>(undefined)

	const [enableButtons, setEnableButtons] = useState<boolean>(false)
	const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>(undefined)
	const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>(undefined)
	const virtuosoRef = useRef<VirtuosoHandle>(null)
	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
	const [isAtBottom, setIsAtBottom] = useState(false)
	const [didScrollFromApiReqTs, setDidScrollFromApiReqTs] = useState<number | undefined>(undefined)

	useEffect(() => {
		const lastMessage = messages.at(-1)
		if (lastMessage) {
			switch (lastMessage.type) {
				case "ask":
					switch (lastMessage.ask) {
						case "api_req_failed":
							setTextAreaDisabled(true)
							setClaudeAsk("api_req_failed")
							setEnableButtons(true)
							setPrimaryButtonText("Retry")
							setSecondaryButtonText("Start New Task")
							break
						case "mistake_limit_reached":
							setTextAreaDisabled(false)
							setClaudeAsk("mistake_limit_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed Anyways")
							setSecondaryButtonText("Start New Task")
							break
						case "followup":
							setTextAreaDisabled(false)
							setClaudeAsk("followup")
							setEnableButtons(false)
							break
						case "tool":
							setTextAreaDisabled(false)
							setClaudeAsk("tool")
							setEnableButtons(true)
							const tool = JSON.parse(lastMessage.text || "{}") as ClaudeSayTool
							switch (tool.tool) {
								case "editedExistingFile":
								case "newFileCreated":
									setPrimaryButtonText("Save")
									setSecondaryButtonText("Reject")
									break
								default:
									setPrimaryButtonText("Approve")
									setSecondaryButtonText("Reject")
									break
							}
							break
						case "command":
							setTextAreaDisabled(false)
							setClaudeAsk("command")
							setEnableButtons(true)
							setPrimaryButtonText("Run Command")
							setSecondaryButtonText("Reject")
							break
						case "command_output":
							setTextAreaDisabled(false)
							setClaudeAsk("command_output")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed While Running")
							setSecondaryButtonText(undefined)
							break
						case "completion_result":
							setTextAreaDisabled(false)
							setClaudeAsk("completion_result")
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setTextAreaDisabled(false)
							setClaudeAsk("resume_task")
							setEnableButtons(true)
							setPrimaryButtonText("Resume Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_completed_task":
							setTextAreaDisabled(false)
							setClaudeAsk("resume_completed_task")
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					switch (lastMessage.say) {
						case "api_req_started":
							if (messages.at(-2)?.ask === "command_output") {
								setInputValue("")
								setTextAreaDisabled(true)
								setSelectedImages([])
								setClaudeAsk(undefined)
								setEnableButtons(false)
							}
							break
					}
					break
			}
		} else {
			setTextAreaDisabled(false)
			setClaudeAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText(undefined)
			setSecondaryButtonText(undefined)
		}
	}, [messages])

	useEffect(() => {
		if (messages.length === 0) {
			setTextAreaDisabled(false)
			setClaudeAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText(undefined)
			setSecondaryButtonText(undefined)
		}
	}, [messages.length])

	const handleSendMessage = useCallback(
		(text: string, images: string[]) => {
			text = text.trim()
			if (text || images.length > 0) {
				if (messages.length === 0) {
					vscode.postMessage({ type: "newTask", text, images })
				} else if (claudeAsk) {
					switch (claudeAsk) {
						case "followup":
						case "tool":
						case "command":
						case "command_output":
						case "completion_result":
						case "resume_task":
						case "resume_completed_task":
						case "mistake_limit_reached":
							vscode.postMessage({
								type: "askResponse",
								askResponse: "messageResponse",
								text,
								images,
							})
							break
					}
				}
				setInputValue("")
				setTextAreaDisabled(true)
				setSelectedImages([])
				setClaudeAsk(undefined)
				setEnableButtons(false)
			}
		},
		[messages.length, claudeAsk]
	)

	useEffect(() => {
		if (selectedPromptContent) {
			handleSendMessage(selectedPromptContent, [])
			vscode.postMessage({ type: "clearSelectedPromptContent" })
			
			// Enable buttons and set appropriate text after using the prompt
			setEnableButtons(true)
			setPrimaryButtonText("Approve")
			setSecondaryButtonText("Reject")
			setClaudeAsk("tool")
			setTextAreaDisabled(false)

			// Clear the selected prompt content
			clearSelectedPromptContent()
		}
	}, [selectedPromptContent, handleSendMessage, clearSelectedPromptContent])

	const startNewTask = useCallback(() => {
		vscode.postMessage({ type: "clearTask" })
	}, [])

	const handlePrimaryButtonClick = useCallback(() => {
		switch (claudeAsk) {
			case "api_req_failed":
			case "command":
			case "command_output":
			case "tool":
			case "resume_task":
			case "mistake_limit_reached":
				vscode.postMessage({ type: "askResponse", askResponse: "yesButtonTapped" })
				break
			case "completion_result":
			case "resume_completed_task":
				startNewTask()
				break
		}
		setTextAreaDisabled(true)
		setClaudeAsk(undefined)
		setEnableButtons(false)
	}, [claudeAsk, startNewTask])

	const handleSecondaryButtonClick = useCallback(() => {
		switch (claudeAsk) {
			case "api_req_failed":
			case "mistake_limit_reached":
				startNewTask()
				break
			case "command":
			case "tool":
				vscode.postMessage({ type: "askResponse", askResponse: "noButtonTapped" })
				break
		}
		setTextAreaDisabled(true)
		setClaudeAsk(undefined)
		setEnableButtons(false)
	}, [claudeAsk, startNewTask])

	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	const selectImages = useCallback(() => {
		vscode.postMessage({ type: "selectImages" })
	}, [])

	const shouldDisableImages =
		!selectedModelInfo.supportsImages || textAreaDisabled || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	const handleMessage = useCallback(
		(e: MessageEvent) => {
			const message: ExtensionMessage = e.data
			switch (message.type) {
				case "action":
					switch (message.action!) {
						case "didBecomeVisible":
							if (!isHidden && !textAreaDisabled && !enableButtons) {
								textAreaRef.current?.focus()
							}
							break
					}
					break
				case "selectedImages":
					const newImages = message.images ?? []
					if (newImages.length > 0) {
						setSelectedImages((prevImages) =>
							[...prevImages, ...newImages].slice(0, MAX_IMAGES_PER_MESSAGE)
						)
					}
					break
				case "invoke":
					switch (message.invoke!) {
						case "sendMessage":
							handleSendMessage(message.text ?? "", message.images ?? [])
							break
						case "primaryButtonClick":
							handlePrimaryButtonClick()
							break
						case "secondaryButtonClick":
							handleSecondaryButtonClick()
							break
					}
			}
		},
		[
			isHidden,
			textAreaDisabled,
			enableButtons,
			handleSendMessage,
			handlePrimaryButtonClick,
			handleSecondaryButtonClick,
		]
	)

	useEvent("message", handleMessage)

	useMount(() => {
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !textAreaDisabled && !enableButtons) {
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, textAreaDisabled, enableButtons])

	const visibleMessages = useMemo(() => {
		return modifiedMessages.filter((message) => {
			switch (message.ask) {
				case "completion_result":
					if (message.text === "") {
						return false
					}
					break
				case "api_req_failed":
				case "resume_task":
				case "resume_completed_task":
					return false
			}
			switch (message.say) {
				case "api_req_finished":
				case "api_req_retried":
					return false
				case "text":
					if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
						return false
					}
					break
				case "inspect_site_result":
					return !!message.images
			}
			return true
		})
	}, [modifiedMessages])

	const toggleRowExpansion = useCallback(
		(ts: number) => {
			const isCollapsing = expandedRows[ts] ?? false
			const isLast = visibleMessages.at(-1)?.ts === ts
			const isSecondToLast = visibleMessages.at(-2)?.ts === ts
			const isLastCollapsedApiReq =
				visibleMessages.at(-1)?.say === "api_req_started" && !expandedRows[visibleMessages.at(-1)?.ts ?? 0]
			setExpandedRows((prev) => ({
				...prev,
				[ts]: !prev[ts],
			}))

			if (isCollapsing && isAtBottom) {
				const timer = setTimeout(() => {
					virtuosoRef.current?.scrollToIndex({
						index: visibleMessages.length - 1,
						align: "end",
					})
				}, 0)
				return () => clearTimeout(timer)
			} else if (isLast || isSecondToLast) {
				if (isCollapsing) {
					if (isSecondToLast && !isLastCollapsedApiReq) {
						return
					}
					const timer = setTimeout(() => {
						virtuosoRef.current?.scrollToIndex({
							index: visibleMessages.length - 1,
							align: "end",
						})
					}, 0)
					return () => clearTimeout(timer)
				} else {
					const timer = setTimeout(() => {
						virtuosoRef.current?.scrollToIndex({
							index: visibleMessages.length - (isLast ? 1 : 2),
							align: "start",
						})
					}, 0)
					return () => clearTimeout(timer)
				}
			}
		},
		[isAtBottom, visibleMessages, expandedRows]
	)

	useEffect(() => {
		const lastMessage = visibleMessages.at(-1)
		const isLastApiReqStarted = lastMessage?.say === "api_req_started"
		if (didScrollFromApiReqTs && isLastApiReqStarted && lastMessage?.ts === didScrollFromApiReqTs) {
			return
		}

		const timer = setTimeout(() => {
			virtuosoRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" })
			setDidScrollFromApiReqTs(isLastApiReqStarted ? lastMessage?.ts : undefined)
		}, 50)

		return () => clearTimeout(timer)
	}, [visibleMessages, didScrollFromApiReqTs])

	const placeholderText = useMemo(() => {
		const text = task ? "Type a message (@ to add context)..." : "Type your task here (@ to add context)..."
		return text
	}, [task])

	const itemContent = useCallback(
		(index: number, message: any) => (
			<ChatRow
				key={message.ts}
				message={message}
				isExpanded={expandedRows[message.ts] || false}
				onToggleExpand={() => toggleRowExpansion(message.ts)}
				lastModifiedMessage={modifiedMessages.at(-1)}
				isLast={index === visibleMessages.length - 1}
			/>
		),
		[expandedRows, modifiedMessages, visibleMessages.length, toggleRowExpansion]
	)

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: isHidden ? "none" : "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			{task ? (
				<TaskHeader
					task={task}
					tokensIn={apiMetrics.totalTokensIn}
					tokensOut={apiMetrics.totalTokensOut}
					doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
					cacheWrites={apiMetrics.totalCacheWrites}
					cacheReads={apiMetrics.totalCacheReads}
					totalCost={apiMetrics.totalCost}
					onClose={handleTaskCloseButtonClick}
				/>
			) : (
				<div
					style={{
						flexGrow: 1,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
					}}>
					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
					<div style={{ padding: "0 20px", flexShrink: 0 }}>
						<h2>What can I do for you?</h2>
						<p>
							Thanks to{" "}
							<VSCodeLink
								href="https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf"
								style={{ display: "inline" }}>
								Claude 3.5 Sonnet's agentic coding capabilities,
							</VSCodeLink>{" "}
							I can handle complex software development tasks step-by-step. With tools that let me create
							& edit files, explore complex projects, and execute terminal commands (after you grant
							permission), I can assist you in ways that go beyond simple code completion or tech support.
						</p>
					</div>
					{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
				</div>
			)}
			{task && (
				<>
					<Virtuoso
						ref={virtuosoRef}
						className="scrollable"
						style={{
							flexGrow: 1,
							overflowY: "scroll",
						}}
						increaseViewportBy={{ top: 3_000, bottom: Number.MAX_SAFE_INTEGER }}
						data={visibleMessages}
						itemContent={itemContent}
						atBottomStateChange={setIsAtBottom}
						atBottomThreshold={100}
					/>
					<div
						style={{
							opacity: primaryButtonText || secondaryButtonText ? (enableButtons ? 1 : 0.5) : 0,
							display: "flex",
							padding: "10px 15px 0px 15px",
						}}>
						{primaryButtonText && (
							<VSCodeButton
								appearance="primary"
								disabled={!enableButtons}
								style={{
									flex: secondaryButtonText ? 1 : 2,
									marginRight: secondaryButtonText ? "6px" : "0",
								}}
								onClick={handlePrimaryButtonClick}>
								{primaryButtonText}
							</VSCodeButton>
						)}
						{secondaryButtonText && (
							<VSCodeButton
								appearance="secondary"
								disabled={!enableButtons}
								style={{ flex: 1, marginLeft: "6px" }}
								onClick={handleSecondaryButtonClick}>
								{secondaryButtonText}
							</VSCodeButton>
						)}
					</div>
				</>
			)}
			<ChatTextArea
				ref={textAreaRef}
				inputValue={inputValue}
				setInputValue={setInputValue}
				textAreaDisabled={textAreaDisabled}
				placeholderText={placeholderText}
				selectedImages={selectedImages}
				setSelectedImages={setSelectedImages}
				onSend={() => handleSendMessage(inputValue, selectedImages)}
				onSelectImages={selectImages}
				shouldDisableImages={shouldDisableImages}
				onHeightChange={() => {
					if (isAtBottom) {
						virtuosoRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "auto" })
					}
				}}
				selectedPromptContent={selectedPromptContent}
			/>
		</div>
	)
}

export default ChatView
