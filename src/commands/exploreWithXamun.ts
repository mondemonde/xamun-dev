import * as vscode from 'vscode';
import * as path from 'path';

export function exploreWithXamun(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('xamun-dev.exploreWithXamun', (uri: vscode.Uri) => {
        if (uri && uri.fsPath) {
            const filePath = uri.fsPath;
            const fileName = path.basename(filePath);
            
            // Get the active text editor
            const editor = vscode.window.activeTextEditor;
            
            // Create a new untitled document
            vscode.workspace.openTextDocument({ content: '', language: 'markdown' }).then(document => {
                vscode.window.showTextDocument(document, vscode.ViewColumn.One).then(editor => {
                    // Insert the initial content
                    editor.edit(editBuilder => {
                        editBuilder.insert(new vscode.Position(0, 0), `# Exploring ${fileName}\n\nFile path: ${filePath}\n\n`);
                    });
                    
                    // Show an information message
                    vscode.window.showInformationMessage(`Exploring ${fileName} with Xamun Dev`);
                });
            });
        } else {
            vscode.window.showErrorMessage('Unable to explore. No file selected.');
        }
    });
}
