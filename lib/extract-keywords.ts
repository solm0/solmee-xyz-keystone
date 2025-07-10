const stopwords: string[] = require('stopwords-ko');

const customStopwords = [
  '있다', '되다', '싶다', '하다', '내', '더', '그냥', '는', '글들', '보고', '있어야', '있었', '하고',
  '그리', '있는', '것이', '같은', '한다', '않는', '내가', '하지', '만든', '아닌', '이유', '만들', '것도', '있고', '필요',
  '쓰고', '쓰는', '하는', '나는', '글을', '기능', '되었', '싶은', '정보'
];
const koreanSuffixes = [
  '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '과', '와', '도', '만',
  '랑', '이랑', '하고', '께', '까지', '부터', '보다', '조차', '마저', '이나', '나',
  '이다', '였다', '되다', '있다', '없다', '싶다', '했', '하고', '했어', '있어야', '어야', '싶어',
  '했는데', '겠', 'ㄴ다', '다', '자', '요', '고', '지', '게', '니까', '는데',
];

function cleanToken(token: string): string | null {
  token = token.toLowerCase();

  for (const suffix of koreanSuffixes.sort((a, b) => b.length - a.length)) {
    if (token.endsWith(suffix) && token.length > suffix.length + 1) {
      token = token.slice(0, -suffix.length);
      break;
    }
  }

  if (
    stopwords.includes(token) ||
    customStopwords.includes(token)
  ) {
    return null;
  }

  return token;
}

export default function extractKeyword(
  text: string,
) {
  const regex = /[a-zA-Z0-9]+|[가-힣]+/g;
  const match = text.match(regex) || [];
  const tokens = match
    .filter(w => w.length > 1)
  
  const keywordCounts: Record<string, number> = {};

  for (let rawToken of tokens) {
    const clean = cleanToken(rawToken);
    if (!clean) continue;

    keywordCounts[clean] = (keywordCounts[clean] || 0) + 1;
  }

  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(kw => kw[1] >= 3)
    .filter(kw => kw)
    .slice(0, 6)
    .map(([key]) => key);
  
  return keywords;
}