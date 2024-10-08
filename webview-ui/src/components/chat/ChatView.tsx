import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import { combineApiRequests } from "../../../../src/shared/combineApiRequests"
import { combineCommandSequences } from "../../../../src/shared/combineCommandSequences"
import { getApiMetrics } from "../../../../src/shared/getApiMetrics"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { normalizeApiConfiguration } from "../../utils/apiUtils"
import Announcement from "./Announcement"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import HistoryPreview from "../history/HistoryPreview"
import TaskHeader from "./TaskHeader"
import { XamunChatMessage, ApiConfiguration } from "../../types/sharedTypes"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface ChatViewProps {
    isHidden: boolean
    showAnnouncement: boolean
    hideAnnouncement: () => void
    showHistoryView: () => void
    showSettingsView: () => void
}

export const MAX_IMAGES_PER_MESSAGE = 20 // Anthropic limits to 20 images

const ChatView: React.FC<ChatViewProps> = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView, showSettingsView }) => {
    const { version, xamunMessages, taskHistory, apiConfiguration } = useExtensionState()

    const task = xamunMessages.length > 0 ? xamunMessages[0] as XamunChatMessage : undefined
    const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(xamunMessages.slice(1))), [xamunMessages])
    const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [textAreaDisabled, setTextAreaDisabled] = useState(false)
    const [selectedImages, setSelectedImages] = useState<string[]>([])

    const [xamunAsk, setXamunAsk] = useState<string | undefined>(undefined)

    const [enableButtons, setEnableButtons] = useState<boolean>(false)
    const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>(undefined)
    const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>(undefined)
    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
    const [isAtBottom, setIsAtBottom] = useState(false)
    const [didScrollFromApiReqTs, setDidScrollFromApiReqTs] = useState<number | undefined>(undefined)

    const { selectedModelInfo } = useMemo(() => normalizeApiConfiguration(apiConfiguration as ApiConfiguration), [apiConfiguration])

    const handleSendMessage = useCallback(
        (text: string, images: string[]) => {
            vscode.postMessage({ type: "newTask", text, images })
        },
        [xamunMessages.length, xamunAsk]
    )

    const startNewTask = useCallback(() => {
        vscode.postMessage({ type: "clearTask" })
    }, [])

    const handleTaskCloseButtonClick = useCallback(() => {
        startNewTask()
    }, [startNewTask])

    const toggleRowExpansion = useCallback(
        (ts: number) => {
            setExpandedRows((prev) => ({
                ...prev,
                [ts]: !prev[ts],
            }))
        },
        []
    )

    const selectImages = useCallback(() => {
        vscode.postMessage({ type: "selectImages" })
    }, [])

    const shouldDisableImages = !selectedModelInfo.supportsImages || textAreaDisabled || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

    const itemContent = useCallback(
        (index: number, message: XamunChatMessage) => (
            <ChatRow
                key={message.ts}
                message={message}
                isExpanded={expandedRows[message.ts] || false}
                onToggleExpand={() => toggleRowExpansion(message.ts)}
                lastModifiedMessage={modifiedMessages.at(-1) as XamunChatMessage | undefined}
                isLast={index === modifiedMessages.length - 1}
            />
        ),
        [expandedRows, modifiedMessages, toggleRowExpansion]
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
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
                <VSCodeButton appearance="icon" aria-label="Settings" onClick={showSettingsView}>
                    <span className="codicon codicon-gear"></span>
                </VSCodeButton>
            </div>
            {task ? (
                <TaskHeader
                    task={task}
                    tokensIn={apiMetrics.inputTokens}
                    tokensOut={apiMetrics.outputTokens}
                    doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
                    cacheWrites={apiMetrics.inputTokens}
                    cacheReads={apiMetrics.outputTokens}
                    totalCost={0}
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
                            Thanks to Xamun Dev's agentic coding capabilities, I can handle complex software development tasks step-by-step. With tools that let me create
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
                            overflowY: "scroll", // always show scrollbar
                        }}
                        increaseViewportBy={{ top: 3_000, bottom: Number.MAX_SAFE_INTEGER }}
                        data={modifiedMessages as XamunChatMessage[]}
                        itemContent={itemContent}
                        atBottomStateChange={setIsAtBottom}
                        atBottomThreshold={100}
                    />
                </>
            )}
            <ChatTextArea
                inputValue={inputValue}
                setInputValue={setInputValue}
                textAreaDisabled={textAreaDisabled}
                placeholderText={task ? "Type a message (@ to add context)..." : "Type your task here (@ to add context)..."}
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
            />
        </div>
    )
}

export default ChatView
