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

   /**
   * Converts a Windows-style relative path to a Linux-style path.
   * @param path The Windows path to convert.
   * @returns The converted Linux-style path.
   */
   export function windowsToLinuxPath(path: string): string {
    let linuxPath = path.replace(/\\/g, '/'); // Replace backslashes with forward slashes

    // If the path starts with a drive letter, convert it to /mnt/drive
    const driveLetterMatch = linuxPath.match(/^([a-zA-Z]):\//);
    if (driveLetterMatch) {
      const driveLetter = driveLetterMatch[1].toLowerCase();
      linuxPath = `/mnt/${driveLetter}${linuxPath.slice(2)}`;
    }

    return linuxPath;
  }



}//end xamun
