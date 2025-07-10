export default function getText(content: any) {
  if (!Array.isArray(content)) return [];

  const paragraphs: string[] = content
    .filter((node): node is { type: string; children: any[] } => 
      typeof node === 'object' &&
      node !== null &&
      'type' in node &&
      node.type === 'paragraph' &&
      Array.isArray(node.children)
    )
    .map(node =>
      node.children
        .filter(child => typeof child.text === 'string')
        .map(child => child.text)
        .join('')
    );

    const text: string = paragraphs.join(' ');

  return text;
}