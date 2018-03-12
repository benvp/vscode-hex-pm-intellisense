import * as vscode from 'vscode';
import * as hexpm from './hexpm';
const semver = require('semver');

export class HexCompletion implements vscode.CompletionItemProvider {
  // tslint:disable-next-line:max-line-length
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    return shouldProvide(document, position) ? provide(document, position) : Promise.resolve([]);
  }
}

function sortCompletionItems(completionItems: vscode.CompletionItem[]): vscode.CompletionItem[] {
  const sorted = completionItems.sort((a, b) => semver.rcompare(a.label, b.label));
  sorted.forEach((item, idx) => (item.sortText = `000-${idx.toString()}`));
  return sorted;
}

function shouldProvide(document: vscode.TextDocument, position: vscode.Position): boolean {
  return isMixfile(document.fileName) && isCursorInDepsBlock(document, position);
}

function provide(document: vscode.TextDocument, position: vscode.Position): Thenable<vscode.CompletionItem[]> {
  const line = document.lineAt(position.line);
  const packageName = getPackageName(line, position);

  if (!packageName) {
    return Promise.resolve([]);
  }

  return getVersionsForPackage(packageName);
}

function tupleBeginIndex(line: vscode.TextLine, position: vscode.Position): number {
  const text = line.text.trim();
  const left = text.substr(0, position.character);
  const tupleBeginIndex = left.lastIndexOf('{');
  return tupleBeginIndex;
}

function getPackageName(line: vscode.TextLine, position: vscode.Position): String {
  const tupleIndex = tupleBeginIndex(line, position);
  const text = line.text.trim().substr(tupleIndex);
  const regex = /:[a-zA-Z_]+/;
  const atoms = text.match(regex) || [''];
  const lastAtom = atoms[atoms.length - 1];
  const packageName = lastAtom.replace(/^:/, '');
  return packageName;
}

function getVersionsForPackage(packageName: String): Promise<vscode.CompletionItem[]> {
  return hexpm.getPackage(packageName)
    .then(res => completionItemsForReleases(res.releases))
    .then(sortCompletionItems)
    .catch(error => {
      if (error.response.status === 404) {
        return [];
      }

      throw error;
    });
}

function completionItemsForReleases(releases: any[]): vscode.CompletionItem[] {
  return releases.map((rel, index, arr) => {
    const completionItem = new vscode.CompletionItem(rel.version, vscode.CompletionItemKind.Property);
    return completionItem;
  });
}

function isMixfile(fileName: String): boolean {
  return fileName.endsWith('mix.exs');
}

function isCursorInDepsBlock(document: vscode.TextDocument, position: vscode.Position): boolean {
  // find deps function definition 'defp deps do'
  const fileStartPosition = new vscode.Position(0, 0);
  const fileEndPosition = new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).range.end.character);
  const leftRange = new vscode.Range(fileStartPosition, position);
  const rightRange = new vscode.Range(position, fileEndPosition);
  const leftText = document.getText(leftRange);
  const rightText = document.getText(rightRange);
  const indexOfDepsHead = leftText.indexOf('defp deps do');
  const indexOfDepsEnd = rightText.indexOf('end');
  const indexOfNextFunctionHead = rightText.indexOf('def') || rightText.indexOf('defp');

  return indexOfDepsHead > -1 && indexOfDepsEnd > -1 && indexOfDepsEnd < indexOfNextFunctionHead;
}
