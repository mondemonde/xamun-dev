// This file serves as a bridge between the main extension and the webview
// Re-export types and variables from the main extension's shared directory

import type { XamunMessage, XamunSayTool, ExtensionMessage as BaseExtensionMessage } from '../../src/shared/ExtensionMessage';
import { mentionRegexGlobal } from '../../src/shared/context-mentions';

export type { XamunMessage, XamunSayTool };
export { mentionRegexGlobal };

// If you need to alias XamunMessage as ClaudeMessage for compatibility reasons:
export type ClaudeMessage = XamunMessage;

// Extend the ExtensionMessage type to include the invoke property
export type ExtensionMessage = BaseExtensionMessage | {
  type: 'invoke';
  invoke: string;
  text?: string;
  images?: string[];
};