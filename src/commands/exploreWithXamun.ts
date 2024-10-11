import * as vscode from 'vscode';
import * as path from 'path';

export function exploreWithXamun(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('xamun-dev.exploreWithXamun', (uri: vscode.Uri) => {
        if (uri && uri.fsPath) {
            const filePath = uri.fsPath;
            const fileName = path.basename(filePath);
            
            // Get the workspace folder
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
            let relativePath = filePath;
            
            if (workspaceFolder) {
                // Calculate the relative path
                relativePath = path.relative(workspaceFolder.uri.fsPath, filePath);
            }
            
            // Open the Prompt Library in a new tab with the relative file path
            vscode.commands.executeCommand('xamun-dev.openPromptLibraryInNewTab', relativePath);
            
            // Show an information message
            vscode.window.showInformationMessage(`Exploring ${fileName} with Xamun Dev Prompt Library`);
        } else {
            vscode.window.showErrorMessage('Unable to explore. No file selected.');
        }
    });
}
