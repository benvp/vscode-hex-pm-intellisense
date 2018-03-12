import * as vscode from 'vscode';
import { shouldProvide } from './shouldProvide';
import { provide } from './provide';

export class HexCompletion implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    return shouldProvide(document, position) ? provide(document, position) : Promise.resolve([]);
  }
}
