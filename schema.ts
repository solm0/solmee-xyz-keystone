import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

import {
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox,
  integer,
} from '@keystone-6/core/fields'

import { document } from '@keystone-6/fields-document'
import { type Lists } from '.keystone/types'

export const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      password: password({ validation: { isRequired: true } }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
      isAdmin: checkbox(),
    },
  }),

  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      publishedAt: timestamp(),
      content: document({
        formatting: {
          inlineMarks: true,
          listTypes: true,
          alignment: true,
          headingLevels: [2, 3, 4],
          blockTypes: true,
          softBreaks: true,
        },
        links: true,
        dividers: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        relationships: {
          post: {
            listKey: 'Post',
            label: 'Internal Link',
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
              content {
                document(hydrateRelationships: true)
              }
            `,
          }
        },
      }),

      tags: relationship({
        ref: 'Tag.posts',
        many: false,
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          linkToItem: true,
          inlineConnect: true,
        },
      }),

      links: relationship({
        ref: 'Post.backlinks',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['title', 'order'],
          linkToItem: true,
          inlineConnect: true,
          inlineEdit: { fields: ['order'] },
        }
      }),

      backlinks: relationship({
        ref: 'Post.links',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['title'],
          linkToItem: true,
          inlineConnect: false,
        }
      }),

      meta: checkbox({
        defaultValue: false,
      }),

      order: integer(),

      status: select({
        options: [
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
        ],
        defaultValue: 'draft',
        ui: { displayMode: 'segmented-control' },
      }),
    },
  }),

  Tag: list({
    access: allowAll,
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
