import { Category } from "./types";

export const CATEGORIES: Category[] = ["T-Shirt", "Panjabi", "Polo Shirt", "Pants", "Trousers"];

export const SIZES = ["S", "M", "L", "XL", "XXL"];

export const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#000080" },
  { name: "Grey", hex: "#808080" },
  { name: "Maroon", hex: "#800000" },
  { name: "Olive", hex: "#808000" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Royal Blue", hex: "#4169E1" }
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  "T-Shirt": ["Half Sleeve", "Full Sleeve"],
  "Panjabi": ["Traditional", "Slim Fit"],
  "Polo Shirt": ["Premium"],
  "Pants": ["Denim", "Gabardine", "Formal"],
  "Trousers": ["Casual", "Activewear"]
};
