import React, { useState, useCallback } from "react"
import { XamunChatMessage } from "../../types/sharedTypes"
import CodeBlock from "../common/CodeBlock"
import CodeAccordian from "../common/CodeAccordian"
import MessageContextMenu from "./MessageContextMenu"
import { removeLeadingNonAlphanumeric } from "../../utils/stringUtils"

interface ChatRowProps {
    message: XamunChatMessage
    isExpanded: boolean
    onToggleExpand: () => void
    lastModifiedMessage?: XamunChatMessage
    isLast: boolean
}

const ChatRow: React.FC<ChatRowProps> = ({ message, isExpanded, onToggleExpand, lastModifiedMessage, isLast }) => {
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault()
        setShowContextMenu(true)
        setContextMenuPosition({ x: event.clientX, y: event.clientY })
    }, [])

    const handleCloseContextMenu = useCallback(() => {
        setShowContextMenu(false)
    }, [])

    const renderContent = () => {
        if (message.type === "ask") {
            return <div>{message.text}</div>
        } else if (message.type === "say") {
            if (message.say === "text") {
                return <div>{message.text}</div>
            } else if (message.say === "error") {
                return <div style={{ color: "red" }}>{message.text}</div>
            } else if (message.say === "api_req_started" || message.say === "api_req_finished") {
                return <div style={{ color: "gray", fontSize: "0.8em" }}>{message.text}</div>
            }
        }
        return null
    }

    return (
        <div onContextMenu={handleContextMenu}>
            {renderContent()}
            {showContextMenu && (
                <MessageContextMenu
                    position={contextMenuPosition}
                    onClose={handleCloseContextMenu}
                    message={message}
                />
            )}
        </div>
    )
}

export default ChatRow
