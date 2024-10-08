import React, { useState, useRef, useCallback, useEffect } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import ChatTextAreaContextMenu, { ContextMenuOptionType } from "./ChatTextAreaContextMenu"

interface ChatTextAreaProps {
    inputValue: string
    setInputValue: (value: string) => void
    textAreaDisabled: boolean
    placeholderText: string
    selectedImages: string[]
    setSelectedImages: (images: string[]) => void
    onSend: () => void
    onSelectImages: () => void
    shouldDisableImages: boolean
    onHeightChange: () => void
}

const ChatTextArea: React.FC<ChatTextAreaProps> = ({
    inputValue,
    setInputValue,
    textAreaDisabled,
    placeholderText,
    selectedImages,
    setSelectedImages,
    onSend,
    onSelectImages,
    shouldDisableImages,
    onHeightChange,
}) => {
    const { filePaths } = useExtensionState()
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedType, setSelectedType] = useState<ContextMenuOptionType | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value
        setInputValue(newValue)
        checkForContextMenu(newValue)
    }

    const checkForContextMenu = (value: string) => {
        const lastAtSymbolIndex = value.lastIndexOf("@")
        if (lastAtSymbolIndex !== -1 && lastAtSymbolIndex === value.length - 1) {
            setShowContextMenu(true)
            setContextMenuPosition(getCaretPosition())
            setSearchQuery("")
        } else if (lastAtSymbolIndex !== -1) {
            const query = value.slice(lastAtSymbolIndex + 1)
            setSearchQuery(query)
            setShowContextMenu(true)
            setContextMenuPosition(getCaretPosition())
        } else {
            setShowContextMenu(false)
        }
    }

    const getCaretPosition = () => {
        const textarea = textAreaRef.current
        if (!textarea) return { x: 0, y: 0 }

        const { offsetLeft, offsetTop } = textarea
        const { scrollLeft, scrollTop } = textarea
        const { selectionStart } = textarea

        const div = document.createElement("div")
        const style = getComputedStyle(textarea)
        const properties = [
            "fontFamily",
            "fontSize",
            "fontWeight",
            "letterSpacing",
            "lineHeight",
            "textIndent",
            "wordSpacing",
            "padding",
        ]

        properties.forEach((prop) => {
            div.style[prop as any] = style[prop as any]
        })

        div.textContent = textarea.value.substring(0, selectionStart)
        div.style.height = "auto"
        div.style.position = "absolute"
        div.style.visibility = "hidden"
        div.style.whiteSpace = "pre-wrap"
        div.style.wordWrap = "break-word"
        div.style.width = textarea.offsetWidth + "px"

        document.body.appendChild(div)
        const { offsetWidth, offsetHeight } = div
        document.body.removeChild(div)

        return {
            x: offsetLeft - scrollLeft + offsetWidth,
            y: offsetTop - scrollTop + offsetHeight,
        }
    }

    const handleContextMenuSelect = (type: ContextMenuOptionType, value?: string) => {
        if (value) {
            const newValue = inputValue.replace(/@[^@]*$/, `@${value} `)
            setInputValue(newValue)
        }
        setShowContextMenu(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showContextMenu) {
            if (event.key === "ArrowDown") {
                event.preventDefault()
                setSelectedIndex((prevIndex) => (prevIndex + 1) % queryItems.length)
            } else if (event.key === "ArrowUp") {
                event.preventDefault()
                setSelectedIndex((prevIndex) => (prevIndex - 1 + queryItems.length) % queryItems.length)
            } else if (event.key === "Enter") {
                event.preventDefault()
                const selectedItem = queryItems[selectedIndex]
                handleContextMenuSelect(selectedItem.type, selectedItem.value)
            } else if (event.key === "Escape") {
                setShowContextMenu(false)
            }
        } else if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            onSend()
        }
    }

    const queryItems = filePaths
        .filter((path) => path.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((path) => ({ type: "file" as ContextMenuOptionType, value: path }))

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
            onHeightChange()
        }
    }, [inputValue, onHeightChange])

    return (
        <div style={{ position: "relative" }}>
            <textarea
                ref={textAreaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={textAreaDisabled}
                placeholder={placeholderText}
                style={{
                    width: "100%",
                    resize: "none",
                    overflow: "hidden",
                }}
            />
            {showContextMenu && (
                <ChatTextAreaContextMenu
                    onSelect={handleContextMenuSelect}
                    searchQuery={searchQuery}
                    onMouseDown={() => {}} // Empty function to satisfy the prop type
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    selectedType={selectedType}
                    queryItems={queryItems}
                />
            )}
            <button onClick={onSend} disabled={textAreaDisabled || !inputValue.trim()}>
                Send
            </button>
            <button onClick={onSelectImages} disabled={shouldDisableImages}>
                Select Images
            </button>
            {selectedImages.length > 0 && (
                <div>
                    {selectedImages.length} image(s) selected
                    <button onClick={() => setSelectedImages([])}>Clear</button>
                </div>
            )}
        </div>
    )
}

export default ChatTextArea
