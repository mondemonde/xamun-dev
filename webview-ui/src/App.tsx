import React, { useCallback, useEffect, useState } from "react"

import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/ExtensionMessage"
import ChatView from "./components/chat/ChatView"
import HistoryView from "./components/history/HistoryView"
import SettingsView from "./components/settings/SettingsView"
import PromptLibraryView from "./components/promptlibrary/PromptLibraryView"
import { ExtensionStateContextProvider, useExtensionState } from "./context/ExtensionStateContext"
import { vscode } from "./utils/vscode"

type View = 'chat' | 'settings' | 'history' | 'promptLibrary';

const AppContent = () => {
	const { didHydrateState, shouldShowAnnouncement } = useExtensionState()
	const [currentView, setCurrentView] = useState<View>('chat');
	const [showAnnouncement, setShowAnnouncement] = useState(false)
	const [isTab, setIsTab] = useState(false)
	const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>(undefined)
	const [selectedPromptContent, setSelectedPromptContent] = useState<string | undefined>(undefined)

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		if (message.type === "action") {
			switch (message.action!) {
				case "settingsButtonTapped":
					setCurrentView('settings');
					break;
				case "historyButtonTapped":
					setCurrentView('history');
					break;
				case "promptLibraryButtonTapped":
					setCurrentView('promptLibrary');
					setIsTab(message.isTab || false);
					setSelectedFilePath(message.selectedFilePath);
					break;
				case "chatButtonTapped":
					setCurrentView('chat');
					break;
			}
		}
	}, [])

	useEvent("message", handleMessage)

	useEffect(() => {
		if (shouldShowAnnouncement) {
			setShowAnnouncement(true)
			vscode.postMessage({ type: "didShowAnnouncement" })
		}
	}, [shouldShowAnnouncement])

	const handleUsePrompt = useCallback((content: string) => {
		setSelectedPromptContent(content)
		setCurrentView('chat');
	}, [])

	if (!didHydrateState) {
		return null
	}

	return (
		<>
			{currentView === 'settings' && <SettingsView onDone={() => setCurrentView('chat')} />}
			{currentView === 'history' && <HistoryView onDone={() => setCurrentView('chat')} />}
			{currentView === 'promptLibrary' && (
				<PromptLibraryView 
					onDone={() => setCurrentView('chat')} 
					isTab={isTab} 
					selectedFilePath={selectedFilePath}
					onUsePrompt={handleUsePrompt}
				/>
			)}
			<ChatView
				showHistoryView={() => setCurrentView('history')}
				isHidden={currentView !== 'chat'}
				showAnnouncement={showAnnouncement}
				hideAnnouncement={() => setShowAnnouncement(false)}
				selectedPromptContent={selectedPromptContent}
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
