import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks';

const intentOptions = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'success', label: 'Success' },
] as const;

export const componentBlocks = {
  codeBlock: component({
    label: 'Code Block',
    schema: {
      caption: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
      code: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
        links: 'inherit',
      }),
    },
    chromeless: true,
    preview: (props) => {
      const caption = props.fields.caption.element;
      const code = props.fields.code.element;
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p style={{
            fontSize: '0.8em',
            color: 'gray',
            }}
          >
            {caption}
          </p>
          <div style={{background: '#F5F5F5', padding: '0.5em', borderRadius: '4px', border: '1px solid lightGray'}}>
            <pre
              style={{
                fontSize: '1em',
                fontFamily: 'monospace',
              }}
            >
              {code}
            </pre>
          </div>
        </div>
      )
    }
  }),

  internalLink: component({
    label: 'Internal Link',
    preview: (props) => {
      const alias = props.fields.alias.element;
      return (
        <span>{alias}</span>
      );
    },
    schema: {
      alias: fields.child({
        kind: 'inline',
        placeholder: 'Alias',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
        links: 'inherit',
      }),
      post: fields.relationship({
        label: 'Post',
        listKey: 'Post',
        selection: `
          id
          title
          links {
            id
            title
          }
          backlinks {
            id
            title
          }
        `,
      }),
    },
    chromeless: false,
  }),
  quote: component({
    preview: (props) => {
      return (
        <div
          style={{
            borderLeft: '3px solid #CBD5E0',
            paddingLeft: 16,
          }}
        >
          <div style={{ fontStyle: 'italic', color: '#4A5568' }}>{props.fields.content.element}</div>
          <div style={{ fontWeight: 'bold', color: '#718096' }}>
            <NotEditable>— </NotEditable>
            {props.fields.attribution.element}
          </div>
        </div>
      );
    },
    label: 'Quote',
    schema: {
      content: fields.child({
        kind: 'block',
        placeholder: 'Quote...',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
        links: 'inherit',
      }),
      attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
    },
    chromeless: true,
  }),

  notice: component({
    preview: function Notice(props) {
      const intentMap = {
        info: {
          background: '#e0f2ff',
          foreground: '#0369a1',
          emoji: 'ℹ️',
        },
        error: {
          background: '#fee2e2',
          foreground: '#b91c1c',
          emoji: '❌',
        },
        warning: {
          background: '#fef9c3',
          foreground: '#92400e',
          emoji: '⚠️',
        },
        success: {
          background: '#dcfce7',
          foreground: '#15803d',
          emoji: '✅',
        },
      };
  
      const intent = props.fields.intent.value;
      const intentConfig = intentMap[intent] ?? intentMap.info;
  
      return (
        <div
          style={{
            display: 'flex',
            borderRadius: '4px',
            background: intentConfig.background,
            padding: '1em',
            margin: '1em 0',
          }}
        >
          <NotEditable>
            <div
              style={{
                color: intentConfig.foreground,
                marginTop: '0.5em',
                marginRight: '0.75em',
                fontSize: '1.25em',
              }}
            >
              {intentConfig.emoji}
            </div>
          </NotEditable>
          <div style={{ flex: 1 }}>{props.fields.content.element}</div>
        </div>
      );
    },
  
    label: 'Notice',
    chromeless: false,
  
    schema: {
      content: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: 'inherit',
        dividers: 'inherit',
        links: 'inherit',
        relationships: 'inherit',
      }),
      intent: fields.select({
        label: 'Intent',
        options: intentOptions,
        defaultValue: 'info',
      }),
    },
  
    toolbar({ props, onRemove }) {
      return (
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          {intentOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => props.fields.intent.onChange(opt.value)}
              style={{
                background: props.fields.intent.value === opt.value ? '#ddd' : '#fff',
                padding: '0.25em 0.5em',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
  
          <button
            type="button"
            onClick={onRemove}
            style={{
              marginLeft: 'auto',
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              padding: '0.25em 0.5em',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      );
    },
  })
};