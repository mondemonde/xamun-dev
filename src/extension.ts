import * as vscode from 'vscode';
import { XamunDevProvider } from './core/webview/XamunDevProvider';
import { ExtensionMessage } from './shared/ExtensionMessage';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("Xamun Dev");
    const provider = new XamunDevProvider(context, outputChannel);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(XamunDevProvider.sideBarId, provider, {
            webviewOptions: { retainContextWhenHidden: true }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('xamun-dev.openInNewTab', () => {
            const panel = vscode.window.createWebviewPanel(
                XamunDevProvider.tabPanelId,
                'Xamun Dev',
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
            );
            provider.resolveWebviewView(panel);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('xamun-dev.plusButtonTapped', () => {
            vscode.commands.executeCommand('workbench.view.extension.xamun-dev-ActivityBar');
            provider.postMessageToWebview({ type: 'action', action: 'plusButtonTapped' } as ExtensionMessage);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('xamun-dev.historyButtonTapped', () => {
            vscode.commands.executeCommand('workbench.view.extension.xamun-dev-ActivityBar');
            provider.postMessageToWebview({ type: 'action', action: 'historyButtonTapped' } as ExtensionMessage);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('xamun-dev.popoutButtonTapped', () => {
            vscode.commands.executeCommand('xamun-dev.openInNewTab');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('xamun-dev.settingsButtonTapped', () => {
            vscode.commands.executeCommand('workbench.view.extension.xamun-dev-ActivityBar');
            provider.postMessageToWebview({ type: 'action', action: 'settingsButtonTapped' } as ExtensionMessage);
        })
    );
}

export function deactivate() {}
