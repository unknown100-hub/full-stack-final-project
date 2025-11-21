import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./assets/fitness-hero.svg', () => ({ default: 'hero.svg' }), { virtual: true });
vi.mock('./components/dashboard', () => ({ default: () => <div data-testid="dashboard-mock">Dashboard</div> }));
vi.mock('./components/mealLog', () => ({ default: () => <div>Meal Log</div> }));
vi.mock('./components/fitnessForm', () => ({ default: () => <div>Fitness Form</div> }));
vi.mock('./components/mealsList', () => ({ default: () => <div>Meals List</div> }));
vi.mock('./lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { fitnessData: [], meals: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { token: 'fake-token' } })),
  },
}));

describe('App landing view', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('shows hero section and auth forms when logged out', () => {
    render(<App />);
    expect(screen.getByText(/Health & Fitness Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Create account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('renders dashboard navigation when token exists', () => {
    window.localStorage.setItem('token', 'existing');
    render(<App />);
    expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });
});
