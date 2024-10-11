import * as vscode from 'vscode';
import * as path from 'path';

export function exploreWithXamun(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('xamun-dev.exploreWithXamun', (uri: vscode.Uri) => {
        if (uri && uri.fsPath) {
            const filePath = uri.fsPath;
            const fileName = path.basename(filePath);
            
            // Open the Prompt Library in a new tab
            vscode.commands.executeCommand('xamun-dev.openPromptLibraryInNewTab');
            
            // Show an information message
            vscode.window.showInformationMessage(`Exploring ${fileName} with Xamun Dev Prompt Library`);
        } else {
            vscode.window.showErrorMessage('Unable to explore. No file selected.');
        }
    });
}
