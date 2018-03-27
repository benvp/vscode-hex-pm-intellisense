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

  const indexOfDepsHead = leftText.indexOf('defp deps do'); //assumes rigid formatting of deps function head
  if (indexOfDepsHead <= -1) {
    return false;
  }

  const leftTextDepsHeadToCursor = leftText.substr(indexOfDepsHead);
  //console.log(leftTextDepsHeadToCursor);

  if (leftTextDepsHeadToCursor.includes('end')) { //assumes end does not appear in the deps block
    //console.log("cursor NOT in deps block");
    return false;
  }

  //console.log("cursor in deps block");
  return true;
}
