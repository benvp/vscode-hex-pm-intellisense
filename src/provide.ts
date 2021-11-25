import * as vscode from 'vscode';
import * as hexpm from './hexpm';

const semver = require('semver');

export function provide(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<vscode.CompletionItem[]> {
  const line = document.lineAt(position.line);
  const packageName = getPackageName(line, position);

  if (!packageName) {
    return Promise.resolve([]);
  }

  return getVersionsForPackage(packageName);
}

function getVersionsForPackage(packageName: String): Promise<vscode.CompletionItem[]> {
  return hexpm
    .getPackage(packageName)
    .then(partitionReleases)
    .then(createCompletionItems)
    .catch((error) => {
      if (error.response.status === 404) {
        return [];
      }

      throw error;
    });
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

function tupleBeginIndex(line: vscode.TextLine, position: vscode.Position): number {
  const text = line.text.trim();
  const left = text.substr(0, position.character);
  const tupleBeginIndex = left.lastIndexOf('{');

  return tupleBeginIndex;
}

type PartitionedRelease = {
  stable?: hexpm.HexRelease;
  rest: hexpm.HexRelease[];
  retired: hexpm.HexRelease[];
};

function partitionReleases(p: hexpm.HexPackage): PartitionedRelease {
  // filter out retired packages
  const retired = p.releases.filter((r) => Object.keys(p.retirements).includes(r.version));
  const stable = p.releases.find((r) => r.version === p.latest_stable_version);
  const rest = p.releases.filter(
    (r) => retired.every((x) => x.version !== r.version) && r.version !== stable?.version,
  );

  return {
    stable,
    retired,
    rest,
  };
}

function createCompletionItems(releases: PartitionedRelease): vscode.CompletionItem[] {
  const stable = releases.stable
    ? new vscode.CompletionItem(releases.stable.version, vscode.CompletionItemKind.Property)
    : null;

  if (stable) {
    stable.detail = 'latest stable';
  }

  const retired = releases.retired.map((r) => {
    const item = new vscode.CompletionItem(r.version, vscode.CompletionItemKind.Property);
    item.detail = 'retired';
    return item;
  });

  const rest = releases.rest.map((r) => {
    return new vscode.CompletionItem(r.version, vscode.CompletionItemKind.Property);
  });

  const sortBySemver = (a: vscode.CompletionItem, b: vscode.CompletionItem) =>
    semver.compare(b.label, a.label);

  const sorted = [
    ...(stable ? [stable] : []),
    ...[...rest].sort(sortBySemver),
    ...[...retired].sort(sortBySemver),
  ];

  sorted.forEach(applySortText);

  return sorted;
}

function applySortText(item: vscode.CompletionItem, index: number) {
  item.sortText = `${'z'.repeat(Math.trunc(index / 10))}${index % 10}`;

  return item;
}
