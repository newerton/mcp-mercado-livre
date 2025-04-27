export interface GetApiProductInput {
  product: string;
  page: number;
}

export interface MercadoLivreCrawlerOutput {
  name: string;
  price: number;
  queryMatchRatio: number;
  url: string;
  shippings: Array<{
    name: string;
    price: number;
    deliveryDays: number;
    originalDescription: string;
  }> | null;
}
