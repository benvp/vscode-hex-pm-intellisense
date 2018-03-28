import * as vscode from 'vscode';

export function shouldProvide(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  return (
    isMixfile(document.fileName) && isCursorInDepsBlock(document, position)
  );
}

function isMixfile(fileName: String): boolean {
  return fileName.endsWith('mix.exs');
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
    // console.log("cursor NOT in deps block");
    return false;
  }

  const depsHeadToCursor = leftText.substr(indexOfDepsHead);
  // console.log(depsHeadToCursor);
  const depsEndRegex = /^[\s]*end$/m;
  if (depsHeadToCursor.search(depsEndRegex) > -1) {
    // assumes `end` does not appear by itself in a line in deps block
    // console.log("cursor NOT in deps block");
    return false;
  }

  // console.log("cursor in deps block");
  return true;
}
