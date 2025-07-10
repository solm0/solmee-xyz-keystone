import { Context } from '.keystone/types';

export default async function saveKeywords(
  extracted: string[],
  existing: {id: string, name: string}[],
  context: Context,
  postId: string,
) {
  let keywordsToSet: {id: string}[] = [];
  let keywordsToCreate: {name: string}[] = [];

  extracted.forEach((kw) => {
    const match = existing.find((e) => e.name === kw);
    if (match) {
      keywordsToSet.push({id: match.id});
    } else if (!keywordsToCreate.find((k) => k.name === kw)) {
      keywordsToCreate.push({name: kw});
    }
  })
  
  console.log("keywordsToSet:", keywordsToSet, "keywordsToCreate:", keywordsToCreate)

  await context.query.Post.updateOne({
    where: { id: postId },
    data: {
      keywords: {
        set: keywordsToSet,
        create: keywordsToCreate,
      },
    },
    query: 'id keywords { id name }',
  });
}