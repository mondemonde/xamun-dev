import React from "react"
import { XamunChatMessage } from "../../types/sharedTypes"
import { removeLeadingNonAlphanumeric } from "../../utils/stringUtils"

interface MessageContextMenuProps {
    position: { x: number; y: number }
    onClose: () => void
    message: XamunChatMessage
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({ position, onClose, message }) => {
    const handleCopyText = () => {
        if (message.text) {
            navigator.clipboard.writeText(message.text)
        }
        onClose()
    }

    const handleCopyCode = () => {
        if (message.type === "say" && message.say === "text" && message.text) {
            const codeBlocks = message.text.match(/```[\s\S]*?```/g)
            if (codeBlocks && codeBlocks.length > 0) {
                const code = codeBlocks[0].replace(/```[\s\S]*?\n/, "").replace(/```$/, "")
                navigator.clipboard.writeText(code)
            }
        }
        onClose()
    }

    return (
        <div
            style={{
                position: "fixed",
                top: position.y,
                left: position.x,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
                zIndex: 1000,
            }}
        >
            <button onClick={handleCopyText}>Copy Text</button>
            <button onClick={handleCopyCode}>Copy Code</button>
        </div>
    )
}

export default MessageContextMenu