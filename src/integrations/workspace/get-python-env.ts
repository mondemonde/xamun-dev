import * as vscode from "vscode"
import * as cp from "child_process"
import * as path from "path"

export async function getPythonEnvironment(): Promise<string | null> {
    const pythonExtension = vscode.extensions.getExtension("ms-python.python")
    if (!pythonExtension) {
        return null
    }

    await pythonExtension.activate()

    const pythonPath = getPythonPath()
    if (!pythonPath) {
        return null
    }

    try {
        const result = await runPythonCommand(pythonPath, ["-c", "import sys; print(sys.executable)"])
        return result.trim()
    } catch (error) {
        console.error("Error getting Python environment:", error)
        return null
    }
}

function getPythonPath(): string | undefined {
    return vscode.workspace.getConfiguration("python").get<string>("pythonPath")
}

function runPythonCommand(pythonPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        cp.execFile(pythonPath, args, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })
}
