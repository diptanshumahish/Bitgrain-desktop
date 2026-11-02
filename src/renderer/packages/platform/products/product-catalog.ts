export type ProductId = "apparel" | "menus" | "albums" | "qr";
export type ProductPlan = "free" | "pro";
export type ProductCycle = "monthly" | "annual";
export type ProductBundle = `${ProductId}-pro-${ProductCycle}`;

export const productBundle = (product: ProductId, cycle: ProductCycle): ProductBundle => `${product}-pro-${cycle}`;
