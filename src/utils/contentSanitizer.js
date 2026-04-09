const BLOCKED_PRODUCT_DESCRIPTION_PHRASES = [
  'جهاز تخدير متقدم مع شاشة رقمية ونظام مراقبة متكامل',
];

const BLOCKED_PRODUCT_WORDS = ['تخدير'];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const sanitizeProductDescription = (text) => {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  BLOCKED_PRODUCT_DESCRIPTION_PHRASES.forEach((phrase) => {
    const matcher = new RegExp(escapeRegExp(phrase), 'g');
    sanitized = sanitized.replace(matcher, '');
  });

  BLOCKED_PRODUCT_WORDS.forEach((word) => {
    const matcher = new RegExp(escapeRegExp(word), 'g');
    sanitized = sanitized.replace(matcher, '');
  });

  // Normalize leftover spacing and punctuation after phrase removal.
  sanitized = sanitized
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.;:|-]+|[\s,.;:|-]+$/g, '')
    .trim();

  return sanitized;
};

export const sanitizeProductRecord = (product) => {
  if (!product || typeof product !== 'object') return product;

  return {
    ...product,
    name: sanitizeProductDescription(product.name),
    description: sanitizeProductDescription(product.description),
    detailed_description: sanitizeProductDescription(product.detailed_description),
    specifications: sanitizeProductDescription(product.specifications),
    features: Array.isArray(product.features)
      ? product.features.map((item) => sanitizeProductDescription(item)).filter(Boolean)
      : product.features,
  };
};
