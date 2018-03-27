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
  const leftRange = new vscode.Range(fileStartPosition, position);
  const leftText = document.getText(leftRange);

  const depsBlockRegex = /def[p]?[\s]+deps[\s]+do$/m; //assumes there is only one `deps` function
  const indexOfDepsHead = leftText.search(depsBlockRegex);
  // console.log(indexOfDepsHead);
  if (indexOfDepsHead <= -1) {
    return false;
  }

  const depsHeadToCursor = leftText.substr(indexOfDepsHead);
  // console.log(depsHeadToCursor);

  const depsBlockEndRegex = /^[\s]*end$/m;
  if (depsHeadToCursor.search(depsBlockEndRegex) > -1) { //assumes `end` does not appear by itself in a line in deps block
    // console.log("cursor NOT in deps block");
    return false;
  }

  // console.log("cursor in deps block");
  return true;
}
