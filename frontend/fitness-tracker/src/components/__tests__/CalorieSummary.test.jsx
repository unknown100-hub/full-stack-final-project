import { render, screen, waitFor } from '@testing-library/react';
import CalorieSummary from '../calorieSummary';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('CalorieSummary', () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  test('aggregates calories for today and week', async () => {
    const now = new Date().toISOString();
    api.get
      .mockResolvedValueOnce({ data: { fitnessData: [{ caloriesBurned: 400, date: now }] } })
      .mockResolvedValueOnce({
        data: {
          meals: [
            {
              date: now,
              foodItems: [
                { calories: 150 },
                { calories: 50 },
              ],
            },
          ],
        },
      });

    render(<CalorieSummary />);

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('today-burn')).toHaveTextContent('400');
    expect(screen.getByTestId('today-intake')).toHaveTextContent('200');
    expect(screen.getByTestId('today-net')).toHaveTextContent('200');
    expect(screen.getByTestId('week-burn')).toHaveTextContent('400');
    expect(screen.getByTestId('week-intake')).toHaveTextContent('200');
  });

  test('shows error when summary fails to load', async () => {
    api.get.mockRejectedValue(new Error('network'));
    render(<CalorieSummary />);
    expect(await screen.findByText(/Failed to load summary/i)).toBeInTheDocument();
  });
});
