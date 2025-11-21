const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.calorieninjas.com/v1/nutrition';
const FALLBACK_PATH = path.join(__dirname, '..', 'data', 'nutritionFallback.json');

let fallbackFoods = [];

try {
  const raw = fs.readFileSync(FALLBACK_PATH, 'utf8');
  fallbackFoods = JSON.parse(raw).map((entry) => ({
    ...entry,
    nameLower: entry.name.toLowerCase(),
    keywords: (entry.keywords || []).map((k) => k.toLowerCase()),
    source: entry.source || 'local-db',
  }));
} catch (err) {
  console.warn('Unable to load fallback nutrition data:', err.message);
  fallbackFoods = [];
}

const fetchFromApi = (query, apiKey) => new Promise((resolve, reject) => {
  const url = new URL(API_URL);
  url.searchParams.set('query', query);

  const req = https.request(
    url,
    {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            const err = new Error(`Nutrition API error (${res.statusCode})`);
            err.payload = body;
            reject(err);
            return;
          }
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    },
  );

  req.on('error', reject);
  req.end();
});

const normalize = (value = '') => value.trim().toLowerCase();

const findFallbackFood = (query) => {
  const needle = normalize(query);
  if (!needle) return null;

  const exact = fallbackFoods.find(
    (food) => food.nameLower === needle || food.keywords.includes(needle),
  );
  if (exact) return exact;

  const partial = fallbackFoods.find(
    (food) =>
      food.nameLower.includes(needle) ||
      needle.includes(food.nameLower) ||
      food.keywords.some((kw) => kw.includes(needle) || needle.includes(kw)),
  );
  if (partial) return partial;

  const tokens = needle.split(/\s+/).filter(Boolean);
  let best = null;
  let bestScore = 0;

  fallbackFoods.forEach((food) => {
    let score = 0;
    tokens.forEach((token) => {
      if (food.nameLower.includes(token)) score += 2;
      if (food.keywords.some((kw) => kw.includes(token))) score += 1;
    });
    if (score > bestScore) {
      best = food;
      bestScore = score;
    }
  });

  return bestScore > 0 ? best : null;
};

const getNutritionEstimate = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) {
    const err = new Error('Query is required');
    err.code = 'EMPTY_QUERY';
    throw err;
  }

  const apiKey = process.env.CALORIE_NINJAS_API_KEY;
  if (apiKey) {
    try {
      const data = await fetchFromApi(trimmed, apiKey);
      const item = data?.items?.[0];
      if (item) {
        return {
          name: item.name,
          caloriesPerServing: Number(item.calories) || 0,
          servingSizeGrams: Number(item.serving_size_g) || null,
          source: 'calorieninjas',
        };
      }
    } catch (err) {
      console.warn('Calorie API lookup failed, falling back to local data:', err.message);
    }
  }

  const fallback = findFallbackFood(trimmed);
  if (fallback) {
    return {
      name: fallback.name,
      caloriesPerServing: fallback.caloriesPerServing,
      servingSizeGrams: fallback.servingSizeGrams,
      source: fallback.source,
    };
  }

  const err = new Error('Food not found in nutrition database');
  err.code = 'NOT_FOUND';
  throw err;
};

module.exports = {
  getNutritionEstimate,
};
