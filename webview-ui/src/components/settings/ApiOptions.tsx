import {
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useMemo, useState } from "react"
import {
	ApiConfiguration,
	ModelInfo,
	anthropicDefaultModelId,
	anthropicModels,
} from "../../../../src/shared/api"
import { useExtensionState } from "../../context/ExtensionStateContext"

interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
}

const ApiOptions = ({ showModelOptions, apiErrorMessage }: ApiOptionsProps) => {
	const { apiConfiguration, setApiConfiguration } = useExtensionState()
	const [anthropicBaseUrlSelected, setAnthropicBaseUrlSelected] = useState(!!apiConfiguration?.anthropicBaseUrl)

	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		setApiConfiguration({ ...apiConfiguration, [field]: event.target.value })
	}

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<div style={{ marginBottom: 10, fontWeight: 'bold', fontSize: '14px' }}>
				Current Provider: Anthropic
			</div>
			<div>
				<VSCodeTextField
					value={apiConfiguration?.apiKey || ""}
					style={{ width: "100%" }}
					type="password"
					onInput={handleInputChange("apiKey")}
					placeholder="Enter API Key...">
					<span style={{ fontWeight: 500 }}>Anthropic API Key</span>
				</VSCodeTextField>

				<VSCodeCheckbox
					checked={anthropicBaseUrlSelected}
					onChange={(e: any) => {
						const isChecked = e.target.checked === true
						setAnthropicBaseUrlSelected(isChecked)
						if (!isChecked) {
							setApiConfiguration({ ...apiConfiguration, anthropicBaseUrl: "" })
						}
					}}>
					Use custom base URL
				</VSCodeCheckbox>

				{anthropicBaseUrlSelected && (
					<VSCodeTextField
						value={apiConfiguration?.anthropicBaseUrl || ""}
						style={{ width: "100%", marginTop: 3 }}
						type="url"
						onInput={handleInputChange("anthropicBaseUrl")}
						placeholder="Default: https://api.anthropic.com"
					/>
				)}

				<p
					style={{
						fontSize: "12px",
						marginTop: 3,
						color: "var(--vscode-descriptionForeground)",
					}}>
					This key is stored locally and only used to make API requests from this extension.
					{!apiConfiguration?.apiKey && (
						<VSCodeLink
							href="https://console.anthropic.com/settings/keys"
							style={{ display: "inline", fontSize: "inherit" }}>
							You can get an Anthropic API key by signing up here.
						</VSCodeLink>
					)}
				</p>
			</div>

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{showModelOptions && (
				<>
					<div className="dropdown-container">
						<label htmlFor="model-id">
							<span style={{ fontWeight: 500 }}>Model</span>
						</label>
						<VSCodeDropdown
							id="model-id"
							value={selectedModelId}
							onChange={handleInputChange("apiModelId")}
							style={{ width: "100%" }}>
							<VSCodeOption value="">Select a model...</VSCodeOption>
							{Object.keys(anthropicModels).map((modelId) => (
								<VSCodeOption
									key={modelId}
									value={modelId}
									style={{
										whiteSpace: "normal",
										wordWrap: "break-word",
										maxWidth: "100%",
									}}>
									{modelId}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</div>

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} />
				</>
			)}
		</div>
	)
}

export const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price)
}

const ModelInfoView = ({ selectedModelId, modelInfo }: { selectedModelId: string; modelInfo: ModelInfo }) => {
	return (
		<p style={{ fontSize: "12px", marginTop: "2px", color: "var(--vscode-descriptionForeground)" }}>
			<ModelInfoSupportsItem
				isSupported={modelInfo.supportsImages}
				supportsLabel="Supports images"
				doesNotSupportLabel="Does not support images"
			/>
			<br />
			<ModelInfoSupportsItem
				isSupported={modelInfo.supportsPromptCache}
				supportsLabel="Supports prompt caching"
				doesNotSupportLabel="Does not support prompt caching"
			/>
			<br />
			<span style={{ fontWeight: 500 }}>Max output:</span> {modelInfo?.maxTokens?.toLocaleString()} tokens
			{modelInfo.inputPrice > 0 && (
				<>
					<br />
					<span style={{ fontWeight: 500 }}>Input price:</span> {formatPrice(modelInfo.inputPrice)}/million
					tokens
				</>
			)}
			{modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && modelInfo.cacheReadsPrice && (
				<>
					<br />
					<span style={{ fontWeight: 500 }}>Cache writes price:</span>{" "}
					{formatPrice(modelInfo.cacheWritesPrice || 0)}/million tokens
					<br />
					<span style={{ fontWeight: 500 }}>Cache reads price:</span>{" "}
					{formatPrice(modelInfo.cacheReadsPrice || 0)}/million tokens
				</>
			)}
			{modelInfo.outputPrice > 0 && (
				<>
					<br />
					<span style={{ fontWeight: 500 }}>Output price:</span> {formatPrice(modelInfo.outputPrice)}/million
					tokens
				</>
			)}
		</p>
	)
}

const ModelInfoSupportsItem = ({
	isSupported,
	supportsLabel,
	doesNotSupportLabel,
}: {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}) => (
	<span
		style={{
			fontWeight: 500,
			color: isSupported ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)",
		}}>
		<i
			className={`codicon codicon-${isSupported ? "check" : "x"}`}
			style={{
				marginRight: 4,
				marginBottom: isSupported ? 1 : -1,
				fontSize: isSupported ? 11 : 13,
				fontWeight: 700,
				display: "inline-block",
				verticalAlign: "bottom",
			}}></i>
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</span>
)

export function normalizeApiConfiguration(apiConfiguration?: ApiConfiguration) {
	const modelId = apiConfiguration?.apiModelId

	let selectedModelId: string
	let selectedModelInfo: ModelInfo

	if (modelId && modelId in anthropicModels) {
		selectedModelId = modelId
		selectedModelInfo = anthropicModels[modelId as keyof typeof anthropicModels]
	} else {
		selectedModelId = anthropicDefaultModelId
		selectedModelInfo = anthropicModels[anthropicDefaultModelId]
	}

	return { selectedModelId, selectedModelInfo }
}

export default memo(ApiOptions)
