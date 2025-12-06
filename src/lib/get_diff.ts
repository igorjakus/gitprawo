import { diffLines, Change } from 'diff';
import { DiffLine } from '../types';

export function getDiff(oldText: string, newText: string): DiffLine[] {
  const changes = diffLines(oldText, newText);
  const diffLinesResult: DiffLine[] = [];
  let lineNumber = 1;

  changes.forEach((change: Change) => {
    // diffLines returns the content including newlines.
    // We want to split by newline to get individual lines.
    // We remove the trailing newline to avoid an empty string at the end of the array
    // if the content ends with a newline.
    const lines = change.value.endsWith('\n') 
      ? change.value.slice(0, -1).split('\n') 
      : change.value.split('\n');
    
    if (lines.length === 1 && lines[0] === '' && change.value === '') return;

    lines.forEach((line) => {
      if (change.added) {
        diffLinesResult.push({
          type: 'added',
          content: line,
          lineNumber: lineNumber++,
        });
      } else if (change.removed) {
        diffLinesResult.push({
          type: 'removed',
          content: line,
          lineNumber: lineNumber++,
        });
      } else {
        diffLinesResult.push({
          type: 'unchanged',
          content: line,
          lineNumber: lineNumber++,
        });
      }
    });
  });

  return diffLinesResult;
}
