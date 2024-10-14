import * as vscode from 'vscode';

export namespace xamun {
  /**
   * Shows a temporary message in the status bar aligned to the right corner.
   * @param message The message to display.
   * @param duration Duration in milliseconds to show the message.
   */
  export function showTimedMessage(message: string, duration: number = 5000) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = message;
    statusBarItem.show();

    setTimeout(() => {
      statusBarItem.hide(); // Hide after the duration
      statusBarItem.dispose(); // Dispose to free resources
    }, duration);
  }
}
