import React from 'react';

/**
 * A ultra-lightweight, high-performance, and safe markdown-to-JSX renderer
 * to ensure bulletproof styling of Zen articles without third-party peer dependency risks.
 */
export function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentKey = 0;

  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${currentKey++}`} className="list-disc list-inside pl-5 my-4 space-y-2 text-[#4A4744] leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle bullet lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push(line.substring(2));
      continue;
    } else if (line.match(/^\d+\.\s/)) {
      flushList();
      const match = line.match(/^\d+\.\s(.*)/);
      const text = match ? match[1] : line;
      elements.push(
        <ol key={`ol-${currentKey++}`} className="list-decimal list-inside pl-5 my-4 space-y-2 text-[#4A4744] leading-relaxed">
          <li dangerouslySetInnerHTML={{ __html: parseInlineStyles(text) }} />
        </ol>
      );
      continue;
    } else {
      flushList();
    }

    // Handle dividers
    if (line === '---' || line === '***' || line === '◇ ◇ ◇') {
      elements.push(
        <div key={currentKey++} className="flex justify-center items-center gap-3 my-8 select-none">
          <span className="w-1 h-1 rounded-full bg-[#C1B5A3]/60" />
          <span className="w-2 h-2 rotate-45 border border-[#8C765C] bg-transparent flex items-center justify-center text-[6px]" />
          <span className="w-1 h-1 rounded-full bg-[#C1B5A3]/60" />
        </div>
      );
      continue;
    }

    // Handle Centered verses / Poetry
    if (line.startsWith('~ ')) {
      elements.push(
        <p key={currentKey++} className="text-center font-serif text-base italic text-[#5C5753] tracking-wider my-4 leading-relaxed font-medium">
          {line.substring(2)}
        </p>
      );
      continue;
    }

    // Handle Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={currentKey++} className="text-3xl font-serif font-medium tracking-tight text-[#2C2A29] mt-8 mb-4 border-b border-[#E8E3DD] pb-2">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={currentKey++} className="text-2xl font-serif font-medium tracking-tight text-[#2C2A29] mt-6 mb-3">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={currentKey++} className="text-xl font-serif font-medium text-[#2C2A29] mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    }
    // Handle Blockquotes
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={currentKey++} className="border-l-4 border-[#C1B5A3] pl-6 py-2 my-6 italic text-[#6B6560] bg-[#F5F2EC] rounded-r-sm">
          {line.substring(2).replace(/^”|”$/g, '')}
        </blockquote>
      );
    }
    // Handle Code Blocks / Formulas
    else if (line.startsWith('```')) {
      let codeContent = '';
      i++; // move past opener
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent += lines[i] + '\n';
        i++;
      }
      elements.push(
        <pre key={currentKey++} className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-md font-mono text-sm overflow-x-auto my-6 shadow-sm border border-[#3C3A38]">
          <code>{codeContent.trim()}</code>
        </pre>
      );
    }
    // Empty line
    else if (line === '') {
      continue;
    }
    // Standard paragraph
    else {
      elements.push(
        <p
          key={currentKey++}
          className="text-base text-[#4A4744] leading-relaxed mb-5 font-sans"
          dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}
        />
      );
    }
  }

  // Flush any remaining list elements
  flushList();

  return <div className="prose prose-stone max-w-none">{elements}</div>;
}

/**
 * Encodes markdown inline styles: bold (**text**), italics (*text* or _text_), links ([text](url)) and inline code (`code`)
 */
function parseInlineStyles(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1C1A19]">$1</strong>');

  // Italics *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-[#5C5753]">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic text-[#5C5753]">$1</em>');

  // Inline code `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-[#F3EFE9] text-[#8C765C] font-mono text-xs px-1.5 py-0.5 rounded border border-[#E4DDD3]">$1</code>');

  // Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#8C765C] border-b border-[#8C765C] hover:text-[#5C4A34] transition-colors">$1</a>');

  return html;
}
