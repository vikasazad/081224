import { type Order, OrderStatus } from "@/types/kitchen";

// Generate sample orders
export function generateSampleOrders(): Order[] {
  return [
    {
      id: "1001",
      customerName: "John Smith",
      items: [
        { name: "Cheeseburger", quantity: 2, price: 8.99 },
        { name: "French Fries", quantity: 1, price: 3.99 },
        { name: "Soda", quantity: 2, price: 1.99 },
      ],
      status: OrderStatus.New,
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: "1002",
      customerName: "Emily Johnson",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 12.99 },
        { name: "Caesar Salad", quantity: 1, price: 7.99 },
      ],
      status: OrderStatus.InPreparation,
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: "1003",
      customerName: "Michael Brown",
      items: [
        { name: "Chicken Wings", quantity: 2, price: 9.99 },
        { name: "Onion Rings", quantity: 1, price: 4.99 },
        { name: "Iced Tea", quantity: 3, price: 2.49 },
      ],
      status: OrderStatus.InPreparation,
      createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: "1004",
      customerName: "Sarah Davis",
      items: [
        { name: "Veggie Wrap", quantity: 1, price: 8.49 },
        { name: "Sweet Potato Fries", quantity: 1, price: 4.49 },
        { name: "Lemonade", quantity: 1, price: 2.99 },
      ],
      status: OrderStatus.Completed,
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: "1005",
      customerName: "David Wilson",
      items: [
        { name: "Steak Sandwich", quantity: 1, price: 14.99 },
        { name: "Mozzarella Sticks", quantity: 1, price: 6.99 },
        { name: "Craft Beer", quantity: 1, price: 5.99 },
      ],
      status: OrderStatus.Completed,
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 75 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 55 * 60000).toISOString(),
    },
    {
      id: "1006",
      customerName: "Jessica Martinez",
      items: [
        { name: "Fish Tacos", quantity: 3, price: 10.99 },
        { name: "Guacamole & Chips", quantity: 1, price: 5.99 },
        { name: "Margarita", quantity: 2, price: 7.99 },
      ],
      status: OrderStatus.New,
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      id: "1007",
      customerName: "Robert Taylor",
      items: [
        { name: "BBQ Ribs", quantity: 1, price: 16.99 },
        { name: "Coleslaw", quantity: 1, price: 3.49 },
        { name: "Cornbread", quantity: 2, price: 2.49 },
      ],
      status: OrderStatus.Completed,
      createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      startedAt: new Date(Date.now() - 100 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 70 * 60000).toISOString(),
    },
  ];
}

// Generate sample menu items
// export function generateSampleMenuItems(): MenuItem[] {
//   return [
//     {
//       id: "m001",
//       name: "Cheeseburger",
//       description:
//         "Juicy beef patty with melted cheese, lettuce, tomato, and special sauce",
//       price: 8.99,
//       category: "Burgers",
//       available: true,
//     },
//     {
//       id: "m002",
//       name: "French Fries",
//       description: "Crispy golden fries seasoned with sea salt",
//       price: 3.99,
//       category: "Sides",
//       available: true,
//     },
//     {
//       id: "m003",
//       name: "Margherita Pizza",
//       description:
//         "Classic pizza with tomato sauce, fresh mozzarella, and basil",
//       price: 12.99,
//       category: "Pizza",
//       available: true,
//     },
//     {
//       id: "m004",
//       name: "Caesar Salad",
//       description:
//         "Romaine lettuce, croutons, parmesan cheese, and Caesar dressing",
//       price: 7.99,
//       category: "Salads",
//       available: true,
//     },
//     {
//       id: "m005",
//       name: "Chicken Wings",
//       description:
//         "Crispy wings tossed in your choice of sauce: Buffalo, BBQ, or Honey Garlic",
//       price: 9.99,
//       category: "Appetizers",
//       available: true,
//     },
//     {
//       id: "m006",
//       name: "Onion Rings",
//       description: "Thick-cut onions battered and fried to golden perfection",
//       price: 4.99,
//       category: "Sides",
//       available: false,
//     },
//     {
//       id: "m007",
//       name: "Veggie Wrap",
//       description:
//         "Grilled vegetables, hummus, and mixed greens in a whole wheat wrap",
//       price: 8.49,
//       category: "Sandwiches",
//       available: true,
//     },
//     {
//       id: "m008",
//       name: "Sweet Potato Fries",
//       description: "Crispy sweet potato fries with a hint of cinnamon",
//       price: 4.49,
//       category: "Sides",
//       available: true,
//     },
//     {
//       id: "m009",
//       name: "Steak Sandwich",
//       description:
//         "Grilled steak with caramelized onions, cheese, and horseradish sauce",
//       price: 14.99,
//       category: "Sandwiches",
//       available: true,
//     },
//     {
//       id: "m010",
//       name: "Mozzarella Sticks",
//       description:
//         "Breaded mozzarella sticks fried until golden, served with marinara sauce",
//       price: 6.99,
//       category: "Appetizers",
//       available: true,
//     },
//     {
//       id: "m011",
//       name: "Fish Tacos",
//       description:
//         "Grilled fish with cabbage slaw, pico de gallo, and lime crema",
//       price: 10.99,
//       category: "Tacos",
//       available: true,
//     },
//     {
//       id: "m012",
//       name: "Guacamole & Chips",
//       description: "Fresh guacamole with house-made tortilla chips",
//       price: 5.99,
//       category: "Appetizers",
//       available: false,
//     },
//     {
//       id: "m013",
//       name: "BBQ Ribs",
//       description: "Slow-cooked ribs glazed with house BBQ sauce",
//       price: 16.99,
//       category: "Mains",
//       available: true,
//     },
//     {
//       id: "m014",
//       name: "Coleslaw",
//       description: "Creamy cabbage and carrot slaw",
//       price: 3.49,
//       category: "Sides",
//       available: true,
//     },
//     {
//       id: "m015",
//       name: "Chocolate Brownie",
//       description: "Warm chocolate brownie with vanilla ice cream",
//       price: 6.99,
//       category: "Desserts",
//       available: true,
//     },
//   ];
// }
