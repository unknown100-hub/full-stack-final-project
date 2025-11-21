const path = require('path');

describe('nutritionService', () => {
  let service;

  beforeAll(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.CALORIE_NINJAS_API_KEY = '';
    const filePath = path.resolve(__dirname, '..', 'services', 'nutritionService.js');
    service = require(filePath);
  });

  afterAll(() => {
    console.warn.mockRestore();
  });

  test('returns local fallback nutrition data when API key is missing', async () => {
    const estimate = await service.getNutritionEstimate('apple');
    expect(estimate).toMatchObject({
      name: expect.stringMatching(/apple/i),
      caloriesPerServing: expect.any(Number),
      source: expect.stringMatching(/local/i),
    });
  });

  test('throws error when food is absent from fallback data', async () => {
    await expect(service.getNutritionEstimate('imaginary-food-item')).rejects.toMatchObject({
      message: 'Food not found in nutrition database',
      code: 'NOT_FOUND',
    });
  });

  test('validates query input', async () => {
    await expect(service.getNutritionEstimate('  ')).rejects.toMatchObject({
      message: 'Query is required',
      code: 'EMPTY_QUERY',
    });
  });
});
