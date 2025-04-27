import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { MercadoLivreService } from '../../application/services/MercadoLivreService.js';

export class MercadoLivreToolsController {
  constructor(
    private server: McpServer,
    private service: MercadoLivreService,
  ) {
    this.registerTools();
  }

  private registerTools() {
    this.registerGetStockToolHandler();
  }

  private registerGetStockToolHandler(): void {
    this.server.tool(
      'get-produtos',
      'Buscar informações básicas de produtos',
      {
        products: z.array(z.string()).describe('Array of product names'),
      },
      async ({ products }) => {
        const infos = await this.service.getProducts(products);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(infos, null, 2),
            },
          ],
        };
      },
    );
  }
}
