# User Guide

## Landing page

- **Hero panel:** Displays the featured health-tracker visual plus the live GMT time chip.
- **Theme toggle:** Top-right button switches between light/dark modes.
- **Authentication cards:** Right column contains “Create account” and “Member login” forms. Both persist tokens to localStorage so you remain logged in across refreshes. Forgot-password link currently surfaces instructions—extend it to integrate with your preferred reset provider.

## Navigation (after login)

- **Dashboard:** Default tab; shows calorie summary cards, Chart.js line graph of calories burned, and recent activity table.
- **Log Fitness:** Form for activity name, duration, calories, and distance. Uses datalist suggestions and zero-state highlighting to prevent blank submissions.
- **Log Meal:** Dynamic form for meal type, multiple food items, auto-calculated calories (local lookup plus fallback to `/users/food-calories`), and manual overrides. Includes lookup + auto buttons per row.
- **Meals:** Simple list of logged meals and foods.
- **Theme/Sign out:** Rightmost nav buttons toggle theme and remove JWT.

## Typical workflow

1. **Register/login** via landing forms.
2. **Add workout:** Navigate to “Log Fitness”, enter details, submit. Toast message confirms.
3. **Add meal:** Use “Log Meal”, leverage auto-calculation or manual calories; submit.
4. **Review trends:** Return to Dashboard to see updates in Summary + chart cards; totals refresh automatically thanks to Axios fetches.

## Tips

- The app auto-saves tokens; use “Sign Out” to clear data on shared machines.
- Nutrition lookup first attempts CalorieNinjas (requires `CALORIE_NINJAS_API_KEY`), then a curated dataset, so responses remain fast even offline.
- Theme preference persists per browser tab via localStorage.

## Troubleshooting

- **Stuck on loading states:** Confirm backend server is running and accessible at `http://localhost:5000`.
- **Authentication errors:** Ensure backend `.env` has `JWT_SECRET` configured and MongoDB is reachable.
- **Nutrition lookup failures:** Provide a CalorieNinjas key or extend `backend/data/nutritionFallback.json` with required foods.*** End Patch
