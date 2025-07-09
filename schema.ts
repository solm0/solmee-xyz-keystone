import 'dotenv/config'
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
    hooks: {
      afterOperation: async ({ operation, item, context }) => {
        if (operation === 'create') {
          const keywordsToConnect = [{ id: "cmcw2y3j70000s1hgxqe8z37r" }, { id: "cmcw2yaow0001s1hg0z2apxp3" }];
          // const keywordsToCreate = [{ name: "안녕" }];

          await context.query.Post.updateOne({
            where: { id: item.id },
            data: {
              keywords: {
                connect: keywordsToConnect,
                // create: keywordsToCreate
              },
            } as any,
            query: 'id keywords { id name }',
          });
        }
      },
      beforeOperation: async ({ operation, resolvedData }) => {
        if (operation === 'create') {
          const hasTag = resolvedData.tags?.connect?.id;

          if (!hasTag) {
            resolvedData.tags = {
              connect: { id: process.env.DEFAULT_TAG_ID },
            };
          }
        }
      },
    },
    fields: {
      title: text({ validation: { isRequired: true } }),
      publishedAt: timestamp(),
      content: document({
        hooks: {
          beforeOperation: async ({ operation, item, resolvedData, context }) => {
            if ((operation === 'update' || operation === 'create') && resolvedData.content) {
              const extractLinkedPostIds = (nodes: any[]): string[] => {
                const ids: string[] = [];
          
                for (const node of nodes) {
                  if (node.type === 'relationship' && node.relationship === 'post' && node.data?.id) {
                    ids.push(node.data.id);
                  }
                  if (node.children) {
                    ids.push(...extractLinkedPostIds(node.children));
                  }
                }
          
                return ids;
              };
          
              const newContent = resolvedData.content as any[];
              const oldContent = item?.content as any[] || [];
          
              const newIds = new Set(extractLinkedPostIds(newContent));
              const oldIds = new Set(extractLinkedPostIds(oldContent));
          
              const toConnect = [...newIds].filter(id => !oldIds.has(id));
              const toDisconnect = [...oldIds].filter(id => !newIds.has(id));
          
              if (toConnect.length || toDisconnect.length) {
                await context.query.Post.updateOne({
                  where: { id: item?.id },
                  data: {
                    internalLinks: {
                      ...(toConnect.length ? { connect: toConnect.map(id => ({ id })) } : {}),
                      ...(toDisconnect.length ? { disconnect: toDisconnect.map(id => ({ id })) } : {}),
                    }
                  },
                });
              }
            }
          }
        },
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

      keywords: relationship({
        ref: 'Keyword.posts',
        many: true,
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

      internalLinks: relationship({
        ref: 'Post.internalBacklinks',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['title'],
          linkToItem: true,
          inlineConnect: false,
        }
      }),

      internalBacklinks: relationship({
        ref: 'Post.internalLinks',
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

  Keyword: list({
    access: allowAll,
    fields: {
      name: text({ isIndexed: 'unique' }),
      posts: relationship({ ref: 'Post.keywords', many: true }),
    },
  }),

} satisfies Lists
