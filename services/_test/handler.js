export default (event, context) => {
  const featured = ['Deep Dish', 'Pepperoni', 'Hawaiian'];
  const speciality = ['Meatzza', 'Spicy Mama', 'Margherita'];
  const pizzas = [...featured, 'veg', ...speciality];
  const fridayPizzas = [...pizzas];

  console.log('==> pizzas: ', fridayPizzas);
  return 'OK';
};
