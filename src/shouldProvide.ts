import * as vscode from 'vscode';

export function shouldProvide(document: vscode.TextDocument, position: vscode.Position): boolean {
  return isMixfile(document.fileName) && isCursorInDepsBlock(document, position);
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
