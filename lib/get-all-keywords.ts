import { Context } from '.keystone/types';

export default async function getAllKeywords(context: Context) {
  const keywords = await context.query.Keyword.findMany({ query: 'id name' });

  const keywordObj: {id: string, name: string}[] = keywords.map(k => ({
    id: k.id,
    name: k.name,
  }));

  return keywordObj;
}