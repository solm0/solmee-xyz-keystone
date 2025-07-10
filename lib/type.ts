export type Post = {
  id: string;
  title: string;
  content?: PostContent | null;
};

export type PostContent = {
  document: ParagraphNode[];
};

export type ParagraphNode = {
  type: 'paragraph' | 'list-item-content' | "layout-area";
  children: FormattedText[];
  textAlign?: 'start' | 'center' | 'end';
};

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  keyboard?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  type?: string;
};