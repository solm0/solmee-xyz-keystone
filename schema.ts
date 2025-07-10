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
import extractKeyword from './lib/extract-keywords'
import getAllKeywords from './lib/get-all-keywords'
import getText from './lib/get-text'
import saveKeywords from './lib/save-keywords'

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
      // 디폴트 태그 저장
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
          afterOperation: async ({ operation, item, context }) => {

            // 내부링크 추출, 저장
            if ((operation === 'update' || operation === 'create') && item?.content) {
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
          
              const content = item.content as any[];
              const linkedPostIds = extractLinkedPostIds(content);
              const uniqueIds = [...new Set(linkedPostIds)];
          
              await context.query.Post.updateOne({
                where: { id: item.id },
                data: {
                  internalLinks: {
                    set: uniqueIds.map(id => ({ id })),
                  },
                },
              });
            }

            // 키워드 추출, 저장
            if (operation === 'update' || operation === 'create') {
              const keywords = await getAllKeywords(context);
              const text = getText(item.content);
    
              if (typeof text !== 'string') return;
              const extracted = extractKeyword(text);
              
              saveKeywords(extracted, keywords, context, item.id);
            }
          },
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
