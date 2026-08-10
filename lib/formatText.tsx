import React from "react";

function cleanUrl(rawUrl: string): { url: string; trailing: string } {
  let url = rawUrl;
  let trailing = "";

  while (url.length > 0 && /[.,!?;:'"\]\)]$/.test(url)) {
    if (
      url.endsWith(")") &&
      (url.match(/\(/g) || []).length === (url.match(/\)/g) || []).length
    ) {
      break;
    }
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

export function renderTextWithLinks(
  text: string | undefined | null,
  linkClassName = "text-red-400 hover:text-red-300 underline font-semibold transition-colors decoration-red-500/50 underline-offset-2 break-words",
): React.ReactNode {
  if (!text) return null;

  const combinedRegex =
    /(?:<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>|\[([^\]]+)\]\((https?:\/\/[^\s\)]+|www\.[^\s\)]+|\/[^\s\)]+)\)|(https?:\/\/[^\s<)]+|www\.[^\s<)]+))/gi;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const precedingText = text.substring(lastIndex, match.index);
    if (precedingText) {
      elements.push(precedingText);
    }

    let href = "";
    let label = "";
    let trailing = "";

    if (match[1] !== undefined) {
      href = match[1];
      label = match[2] || match[1];
    } else if (match[3] !== undefined) {
      label = match[3];
      href = match[4];
    } else if (match[5] !== undefined) {
      const cleaned = cleanUrl(match[5]);
      href = cleaned.url;
      label = cleaned.url;
      trailing = cleaned.trailing;
    }

    if (href.startsWith("www.")) {
      href = `https://${href}`;
    }

    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");

    elements.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={linkClassName}
      >
        {label}
      </a>,
    );

    if (trailing) {
      elements.push(trailing);
    }

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    elements.push(remainingText);
  }

  return elements;
}
