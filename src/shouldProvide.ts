import * as vscode from 'vscode';

export function shouldProvide(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  return (
    isCursorInDepsBlock(document, position) &&
    isCursorInString(document, position)
  );
}

function isCursorInDepsBlock(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  // find deps function definition 'defp deps do'
  const leftText = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );

  const depsHeadRegex = /def[p]?[\s]+deps[\s]+do$/m; // assumes there is only one `deps` function
  const indexOfDepsHead = leftText.search(depsHeadRegex);
  if (indexOfDepsHead <= -1) {
    return false;
  }

  const depsHeadToCursor = leftText.substr(indexOfDepsHead);
  const depsEndRegex = /^[\s]*end$/m;
  if (depsHeadToCursor.search(depsEndRegex) > -1) {
    // assumes `end` does not appear by itself in a line in deps block
    return false;
  }

  return true;
}

function isCursorInString(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const line = document.lineAt(position.line);

  const leftText = document.getText(
    new vscode.Range(line.range.start, position)
  );

  const rightText = document.getText(
    new vscode.Range(position, line.range.end)
  );

  if (leftText.indexOf('"') === -1 || rightText.indexOf('"') === -1) {
    return false;
  }

  return true;
}
