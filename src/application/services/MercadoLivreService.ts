import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import voca from 'voca';

import { MercadoLivreCrawlerOutput } from '../../domain/models/MercadoLivreServiceModel.js';
import { wordsMatching } from '../../domain/utils/crawler/words-matching.js';
import { MercadoLivreApiService } from '../../infrastructure/services/MercadoLivreApiService.js';

export class MercadoLivreService {
  url: string | null = null;
  pageContent: cheerio.CheerioAPI | null = null;
  products: MercadoLivreCrawlerOutput[] = [];
  page: number = 1;

  constructor(private apiService: MercadoLivreApiService) {}

  async getProducts(products: string[]) {
    // const data = [];
    // for (const product of products) {
    this.page = 1;
    this.products = [];

    await this.getItems(products[0]);
    const lowestValueItem = this.getLowestValueItem();

    // data.push(lowestValueItem);
    // }
    return lowestValueItem;
  }

  private getLowestValueItem = (): MercadoLivreCrawlerOutput[] => {
    const items: MercadoLivreCrawlerOutput[] = [];

    this.getFreeShipping();
    for (const product of this.products) {
      items.push({
        name: product.name,
        price: product.price,
        queryMatchRatio: product.queryMatchRatio,
        url: product.url,
        shippings: product.shippings,
      });
    }

    items.sort((a, b) => a.price - b.price);

    return items;
  };

  private getItems = async (product: string): Promise<void> => {
    const body = await this.request(product);
    if (body) {
      const hasItems = this.hasItems();

      if (hasItems) {
        this.parseHTML(product);

        const hasPagination = this.hasPagination();
        if (hasPagination) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await this.getItems(product);
        }
      }
    }
  };

  private getFreeShipping = (): void => {
    const products = [];
    for (const product of this.products) {
      if (product.shippings && product.shippings.length > 0) {
        products.push(product);
      }
    }
    this.products = products;
  };

  private hasItems = (): boolean => {
    const $ = this.pageContent;
    if (!$) {
      return false;
    }
    return $('.ui-search-layout__item').length > 0;
  };

  private hasPagination = (): boolean => {
    const $ = this.pageContent;
    if (!$) {
      return false;
    }
    const buttonNext = $('[class="andes-pagination__button--next"]').length > 0;
    if (buttonNext) {
      this.page++;
    }

    if (this.page > 2) {
      return false;
    }

    return buttonNext;
  };

  private request = async (query: string): Promise<any> => {
    const search = voca.slugify(query);
    const limit = 50;
    const page = this.page > 1 ? `_Desde_${limit * (this.page - 1) + 1}` : '';

    const html = await this.apiService
      .getProduct({
        product: search,
        page: Number(page),
      })
      .then((response) => {
        if (response) {
          this.pageContent = cheerio.load(response);
          return response;
        }
        return null;
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        return null;
      });

    if (!html) {
      console.error('Error fetching product:', html);
      return null;
    }

    return html;
  };

  private parseHTML = (product: string): void => {
    const $ = this.pageContent;
    if (!$) {
      console.error('Error parsing HTML: No content available');
      return;
    }

    const uiSearchLayoutItem = this.layoutItems();

    if (uiSearchLayoutItem) {
      uiSearchLayoutItem.each((_, element) => {
        const uiSearchItemTitle = $(element)
          .find('div[class="poly-card__content"] h3')
          .text();
        const productOriginalName = voca(uiSearchItemTitle).trim().value();
        const price = this.getPrice(element);

        const matching = wordsMatching({
          originalName: productOriginalName,
          querySearchByFilter: product,
          price,
          debug: false,
        });

        if (matching.queryMatchRatio >= 0.8) {
          if (price) {
            const productUrl = this.getUrl(element);
            const shippings = this.getShippings(element);

            this.products.push({
              name: productOriginalName,
              price,
              queryMatchRatio: matching.queryMatchRatio,
              url: productUrl,
              shippings,
            });
          }
        }
      });
    }
  };

  private layoutItems = () => {
    const $ = this.pageContent;
    if (!$) {
      return null;
    }

    const uiSearchLayoutItem = $('.ui-search-layout__item');
    const hasItems = uiSearchLayoutItem.length > 0;
    if (hasItems) {
      return uiSearchLayoutItem;
    }
    return null;
  };

  private getPrice = (element: Element): number | undefined => {
    const $ = this.pageContent;
    if (!$) {
      return undefined;
    }
    const productPrice = $(element)
      .find('div[class="poly-price__current"] span:eq(0)')
      .text();
    if (productPrice === '') {
      return undefined;
    }

    return parseFloat(
      productPrice
        .replace('R$', '')
        .replace('.', '')
        .replace(',', '.')
        .replace(/\s/g, ''),
    );
  };

  private getUrl = (element: Element): string => {
    const $ = this.pageContent;
    if (!$) {
      return '';
    }
    const productUrl = $(element)
      .find('a[class="poly-component__title"]')
      .attr('href');
    if (!productUrl) {
      return '';
    }
    return productUrl;
  };

  private getShippings = (
    element: Element,
  ): Array<{
    name: string;
    price: number;
    deliveryDays: number;
    originalDescription: string;
  }> => {
    const $ = this.pageContent;
    if (!$) {
      return [];
    }
    const productShipping: {
      name: string;
      price: number;
      deliveryDays: number;
      originalDescription: string;
    }[] = [];

    const shippingFreeText = $(element)
      .find('div[class="poly-component__shipping"]')
      .text();

    if (shippingFreeText) {
      productShipping.push({
        name: 'Frete grátis',
        price: 0,
        deliveryDays: 0,
        originalDescription: shippingFreeText,
      });
    }

    const shippingFullText = $(element)
      .find('span[class="poly-component__shipped-from"]')
      .text();

    if (shippingFullText) {
      const isFull =
        $(element).find('span[class="poly-component__shipped-from"] svg')
          .length > 0;
      productShipping.push({
        name: isFull ? 'Enviado pelo Full' : shippingFullText,
        price: 0,
        deliveryDays: 0,
        originalDescription: shippingFullText,
      });
    }

    const shippingInternationalText = $(element)
      .find('div[class="poly-component__cbt"]')
      .text();

    if (shippingInternationalText) {
      productShipping.push({
        name: 'Compra Internacional',
        price: 0,
        deliveryDays: 0,
        originalDescription: shippingInternationalText,
      });
    }

    return productShipping;
  };
}
