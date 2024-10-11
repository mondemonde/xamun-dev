import React, { useCallback, useEffect, useState } from "react"

import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/ExtensionMessage"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import SettingsView from "./components/settings/SettingsView"
import PromptLibraryView from "./components/promptlibrary/PromptLibraryView"
import { ExtensionStateContextProvider, useExtensionState } from "./context/ExtensionStateContext"
import { vscode } from "./utils/vscode"

const AppContent = () => {
	const { didHydrateState, shouldShowAnnouncement } = useExtensionState()
	const [showSettings, setShowSettings] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showPromptLibrary, setShowPromptLibrary] = useState(false)
	const [showAnnouncement, setShowAnnouncement] = useState(false)
	const [isTab, setIsTab] = useState(false)
	const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(undefined)

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		switch (message.type) {
			case "action":
				switch (message.action!) {
					case "settingsButtonTapped":
						setShowSettings(true)
						setShowHistory(false)
						setShowPromptLibrary(false)
						break
					case "historyButtonTapped":
						setShowSettings(false)
						setShowHistory(true)
						setShowPromptLibrary(false)
						break
					case "promptLibraryButtonTapped":
						setShowSettings(false)
						setShowHistory(false)
						setShowPromptLibrary(true)
						setIsTab(message.isTab || false)
						setSelectedFilePath(message.selectedFilePath)
						break
					case "chatButtonTapped":
						setShowSettings(false)
						setShowHistory(false)
						setShowPromptLibrary(false)
						break
				}
				break
		}
	}, [])

	useEvent("message", handleMessage)

	useEffect(() => {
		if (shouldShowAnnouncement) {
			setShowAnnouncement(true)
			vscode.postMessage({ type: "didShowAnnouncement" })
		}
	}, [shouldShowAnnouncement])

	if (!didHydrateState) {
		return null
	}

	return (
		<>
			{showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
			{showHistory && <HistoryView onDone={() => setShowHistory(false)} />}
			{showPromptLibrary && (
				<PromptLibraryView 
					onDone={() => setShowPromptLibrary(false)} 
					isTab={isTab} 
					selectedFilePath={selectedFilePath}
				/>
			)}
			{/* Do not conditionally load ChatView, it's expensive and there's state we don't want to lose (user input, disableInput, askResponse promise, etc.) */}
			<ChatView
				showHistoryView={() => {
					setShowSettings(false)
					setShowHistory(true)
					setShowPromptLibrary(false)
				}}
				isHidden={showSettings || showHistory || showPromptLibrary}
				showAnnouncement={showAnnouncement}
				hideAnnouncement={() => {
					setShowAnnouncement(false)
				}}
			/>
		</>
	)
}

const App = () => {
	return (
		<ExtensionStateContextProvider>
			<AppContent />
		</ExtensionStateContextProvider>
	)
}

export default App
