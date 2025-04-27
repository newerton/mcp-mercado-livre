import voca from 'voca';

import { GetApiProductInput } from '../../domain/models/MercadoLivreServiceModel.js';

export class MercadoLivreApiService {
  private readonly API_BASE = 'https://lista.mercadolivre.com.br';
  private readonly HEADERS = {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Sec-Ch-Ua': '"Brave";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': 'Linux',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Sec-Gpc': '1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  };

  async makeTextRequest<T>(
    endpoint: string,
    headers: Record<string, string>,
  ): Promise<T | null> {
    const url = `${this.API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.text()) as T;
    } catch (error) {
      console.error('Error making API request:', error);
      return null;
    }
  }

  getUrlBase(): string {
    return this.API_BASE;
  }

  async getProduct(input: GetApiProductInput): Promise<string | null> {
    const { product, page = 1 } = input;
    const search = voca.slugify(product);
    const limit = 50;
    const newPage = page > 1 ? `_Desde_${limit * (page - 1) + 1}` : '';

    const headers = {
      ...this.HEADERS,
      Referer: `${this.API_BASE}/${search}`,
    };

    const data = await this.makeTextRequest<string>(
      `/novo/${search}${newPage}_OrderId_PRICE_NoIndex_True`,
      headers,
    );
    if (!data) return null;
    return data;
  }
}
