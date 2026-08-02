export const CUSTOM_BASE_PRICE = 199;

export const PIZZA_OPTIONS = [
  {
    key: 'base',
    title: 'Choose Your Base',
    single: true,
    options: [
      { name: 'Thin Crust', price: 0 },
      { name: 'Thick Crust', price: 20 },
      { name: 'Cheese Burst', price: 60 },
      { name: 'Stuffed Crust', price: 60 },
      { name: 'Whole Wheat', price: 30 },
    ],
  },
  {
    key: 'sauce',
    title: 'Pick a Sauce',
    single: true,
    options: [
      { name: 'Classic Tomato', price: 0 },
      { name: 'Spicy Tomato', price: 0 },
      { name: 'BBQ', price: 20 },
      { name: 'Pesto', price: 30 },
      { name: 'White Garlic', price: 20 },
    ],
  },
  {
    key: 'cheese',
    title: 'Select Cheese',
    single: true,
    options: [
      { name: 'Mozzarella', price: 0 },
      { name: 'Cheddar', price: 30 },
      { name: 'Parmesan', price: 40 },
      { name: 'Processed Cheese', price: 20 },
      { name: 'Vegan Cheese', price: 50 },
    ],
  },
  {
    key: 'vegetables',
    title: 'Add Vegetables',
    single: false,
    options: [
      { name: 'Onion', price: 15 },
      { name: 'Tomato', price: 15 },
      { name: 'Capsicum', price: 15 },
      { name: 'Jalapeño', price: 15 },
      { name: 'Sweet Corn', price: 20 },
      { name: 'Mushroom', price: 25 },
      { name: 'Black Olive', price: 25 },
      { name: 'Green Olive', price: 25 },
      { name: 'Paneer', price: 40 },
      { name: 'Broccoli', price: 15 },
    ],
  },
];

export function optionPrice(stepKey, name) {
  const step = PIZZA_OPTIONS.find((s) => s.key === stepKey);
  return step?.options.find((o) => o.name === name)?.price ?? 0;
}

export function addonsPrice(selections) {
  return PIZZA_OPTIONS.reduce((sum, step) => {
    if (step.single) {
      return sum + optionPrice(step.key, selections[step.key]);
    }
    const selected = Array.isArray(selections[step.key]) ? selections[step.key] : [];
    return sum + selected.reduce((total, name) => total + optionPrice(step.key, name), 0);
  }, 0);
}
