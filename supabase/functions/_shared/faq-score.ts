export type KeywordFaq = { keywords?: string[] };
export const compact = (value: string) => value.toLowerCase().replace(/[^0-9a-z가-힣]/g, '');

// Prefer a complete place name over several generic words such as "소개" or "관광".
export const lexicalScore = (question: string, faq: KeywordFaq) => {
  const target = compact(question);
  const terms = [...new Set((faq.keywords || []).map(compact))].filter(term => term.length >= 2 && target.includes(term));
  return Math.max(0, ...terms.map(term => term.length ** 2)) + Math.min(terms.length, 5) / 100;
};
