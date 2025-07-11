import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks';

export const componentBlocks = {
  internalLink: component({
    label: 'internal Link',
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
};