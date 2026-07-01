export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  images: ProductImage[];
};

export type Variant = {
  id: string;
  title: string;
  price: number;
  product: Product;
};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: Variant;
};

export type ReturnRequest = {
  id: string;
  reason: string;
  type: string;
  isDefective: boolean;
  mediaUrl: string;
  status: string;
};

export type Order = {
  id: string;
  amount: number;
  status: string;
  shippingStatus: string;
  awb: string | null;
  trackingNumber: string | null;
  createdAt: string;
  returnRequest: ReturnRequest | null;
  items: OrderItem[];
};
