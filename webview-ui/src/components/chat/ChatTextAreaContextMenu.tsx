import React from "react"

export type ContextMenuOptionType = "file" | "folder" | "command" | "mention"

interface ChatTextAreaContextMenuProps {
    onSelect: (type: ContextMenuOptionType, value?: string) => void
    searchQuery: string
    onMouseDown: () => void
    selectedIndex: number
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
    selectedType: ContextMenuOptionType | null
    queryItems: Array<{ type: ContextMenuOptionType; value: string }>
}

const ChatTextAreaContextMenu: React.FC<ChatTextAreaContextMenuProps> = ({
    onSelect,
    searchQuery,
    onMouseDown,
    selectedIndex,
    setSelectedIndex,
    selectedType,
    queryItems,
}) => {
    return (
        <div
            style={{
                position: "absolute",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
                zIndex: 1000,
            }}
            onMouseDown={onMouseDown}
        >
            {queryItems.map((item, index) => (
                <div
                    key={`${item.type}-${item.value}`}
                    style={{
                        padding: "4px 8px",
                        cursor: "pointer",
                        backgroundColor: index === selectedIndex ? "#f0f0f0" : "transparent",
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => onSelect(item.type, item.value)}
                >
                    {item.value}
                </div>
            ))}
        </div>
    )
}

export default ChatTextAreaContextMenu