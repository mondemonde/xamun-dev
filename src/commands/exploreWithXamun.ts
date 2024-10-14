import * as vscode from 'vscode';
import * as path from 'path';
import { xamun } from '../utils/xamunHelper';

export function exploreWithXamun(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('xamun-dev.askXamunDev', (uri: vscode.Uri) => {
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
            
            // Show an information message with the new text
            //vscode.window.showInformationMessage(`Ask Xamun Dev about ${fileName}`);
            xamun.showTimedMessage(`Ask Xamun Dev about ${fileName}`, 5000); // Use the function

        } else {
            //vscode.window.showErrorMessage('Unable to ask Xamun Dev. No file selected.');
            xamun.showTimedMessage('Unable to ask Xamun Dev. No file selected.', 5000); // Use the function
        }
        

    });
}
