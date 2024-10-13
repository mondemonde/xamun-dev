import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export function logAiFiles() {
    console.log('Searching for AI folder...');

    let aiFolder: string | null = null;

    // Log current working directory and extension context
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`__dirname: ${__dirname}`);
    console.log(`__filename: ${__filename}`);

    // Check if we're running in development mode
    const isDevelopment = process.env.VSCODE_DEBUG_MODE === 'true';
    console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);


   
    // Get the extension path
    const extension = vscode.extensions.getExtension('mondemonde.xamun-dev');
    if (extension) {
        console.log(`Extension path: ${extension.extensionPath}`);
        
        // Check for AI folder in the extension path
        const possibleAiFolders = [
            path.join(extension.extensionPath, 'dist', 'ai'),
            path.join(extension.extensionPath, 'src', 'ai'),
            path.join(extension.extensionPath, 'ai'),
        ];

        for (const folder of possibleAiFolders) {
            console.log(`Checking for AI folder at: ${folder}`);
            if (fs.existsSync(folder)) {
                aiFolder = folder;
                console.log(`AI folder found: ${aiFolder}`);
                break;
            }
        }
    } else {
        console.log('Extension not found. Trying alternative methods...');
    }

    // If AI folder is still not found, check in the workspace
    if (!aiFolder) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            console.log(`Workspace folder: ${workspaceFolder.uri.fsPath}`);
            const workspacePaths = [
                path.join(workspaceFolder.uri.fsPath, 'dist', 'ai'),
                path.join(workspaceFolder.uri.fsPath, 'src', 'ai'),
                path.join(workspaceFolder.uri.fsPath, 'ai'),
            ];

            for (const workspacePath of workspacePaths) {
                console.log(`Checking workspace path: ${workspacePath}`);
                if (fs.existsSync(workspacePath)) {
                    aiFolder = workspacePath;
                    console.log(`AI folder found in workspace: ${aiFolder}`);
                    break;
                }
            }
        } else {
            console.log('No workspace folder found');
        }
    }

    // If still not found, check in production environment
    if (!aiFolder) {
        const homeDir = os.homedir();
        const extensionsDir = path.join(homeDir, '.vscode', 'extensions');
        
        console.log(`Checking extensions directory: ${extensionsDir}`);

        if (fs.existsSync(extensionsDir)) {
            const extensionDirs = fs.readdirSync(extensionsDir);
            console.log(`Extension directories: ${extensionDirs.join(', ')}`);
            const extensionDir = extensionDirs.find(dir => dir.startsWith('mondemonde.xamun-dev-'));

            if (extensionDir) {
                const fullExtensionPath = path.join(extensionsDir, extensionDir);
                console.log(`Extension directory found: ${fullExtensionPath}`);

                const possibleAiFolders = [
                    path.join(fullExtensionPath, 'dist', 'ai'),
                    path.join(fullExtensionPath, 'src', 'ai'),
                    path.join(fullExtensionPath, 'ai'),
                ];

                for (const folder of possibleAiFolders) {
                    console.log(`Checking for AI folder at: ${folder}`);
                    if (fs.existsSync(folder)) {
                        aiFolder = folder;
                        console.log(`AI folder found: ${aiFolder}`);
                        break;
                    }
                }

                if (!aiFolder) {
                    console.log('AI folder not found in production environment');
                }
            } else {
                console.log('Extension directory not found in production environment');
            }
        } else {
            console.log('VS Code extensions directory not found');
        }
    }

    if (!aiFolder) {
        console.log('AI folder not found in any environment');
        return;
    }

    const files = fs.readdirSync(aiFolder);
    
    console.log('Files in the AI folder:');
    files.forEach(file => {
        const filePath = path.join(aiFolder!, file);
        console.log(filePath);
    });
}

export function logAiFiles2() {
    console.log('Searching for AI folder...');

    //let aiFolder: string | null = '';

    // Log current working directory and extension context
    //console.log(`Current working directory: ${process.cwd()}`);
    console.log(`__dirname: ${__dirname}`);   

    const aiFolder = path.join(__dirname,"ai");
    console.log('aiFolder', aiFolder);
   

    const files = fs.readdirSync(aiFolder);
    
    console.log('Files in the AI folder:');
    files.forEach(file => {
        const filePath = path.join(aiFolder!, file);
        console.log(filePath);
    });
}
