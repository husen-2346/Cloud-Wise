import React from 'react';

export interface MarkdownContentProps {
  content: string;
  className?: string;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Matches **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-tint px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-brand-600"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: Array<{
    type: 'heading' | 'paragraph' | 'list' | 'table';
    level?: number;
    text?: string;
    items?: string[];
    rows?: string[][];
  }> = [];

  const splitTableRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const isTableSeparator = (line: string) => {
    const cells = splitTableRow(line);
    return (
      cells.length > 0 &&
      cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
    );
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: heading[2].replace(/\*\*/g, ''),
      });
      index += 1;
      continue;
    }

    if (
      line.includes('|') &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      const rows = [splitTableRow(line)];
      index += 2;
      while (
        index < lines.length &&
        lines[index].trim().includes('|') &&
        lines[index].trim()
      ) {
        rows.push(splitTableRow(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (
        index < lines.length &&
        (/^\s*[-*]\s+/.test(lines[index]) ||
          /^\s*\d+[.)]\s+/.test(lines[index]))
      ) {
        items.push(
          lines[index]
            .trim()
            .replace(/^[-*]\s+/, '')
            .replace(/^\d+[.)]\s+/, ''),
        );
        index += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+[.)]\s+/.test(lines[index].trim())
    ) {
      if (
        lines[index].includes('|') &&
        index + 1 < lines.length &&
        isTableSeparator(lines[index + 1].trim())
      ) {
        break;
      }
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return (
    <div className={`space-y-4 text-sm leading-relaxed text-body ${className}`}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h1
                key={blockIndex}
                className="text-lg font-semibold text-ink pt-2 border-b border-line pb-1.5"
              >
                {renderInlineMarkdown(block.text ?? '')}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2
                key={blockIndex}
                className="text-base font-semibold text-ink pt-1.5"
              >
                {renderInlineMarkdown(block.text ?? '')}
              </h2>
            );
          }
          return (
            <h3
              key={blockIndex}
              className="text-sm font-semibold text-ink"
            >
              {renderInlineMarkdown(block.text ?? '')}
            </h3>
          );
        }

        if (block.type === 'list') {
          return (
            <ul
              key={blockIndex}
              className="list-disc space-y-1.5 pl-5 marker:text-brand-500"
            >
              {(block.items ?? []).map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'table') {
          const rows = block.rows ?? [];
          return (
            <div
              key={blockIndex}
              className="overflow-x-auto rounded-xl border border-line bg-surface shadow-xs my-3"
            >
              <table className="w-full min-w-[480px] border-collapse text-left text-xs leading-5">
                <thead className="bg-app text-ink font-semibold">
                  <tr>
                    {(rows[0] ?? []).map((cell, cellIndex) => (
                      <th
                        key={cellIndex}
                        className="border-b border-line px-3.5 py-2.5"
                      >
                        {renderInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {rows.slice(1).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="align-top hover:bg-tint/20 transition-colors even:bg-tint/10"
                    >
                      {(rows[0] ?? []).map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3.5 py-2.5 text-body"
                        >
                          {renderInlineMarkdown(row[cellIndex] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={blockIndex} className="text-body leading-relaxed">
            {renderInlineMarkdown(block.text ?? '')}
          </p>
        );
      })}
    </div>
  );
}

export default MarkdownContent;
