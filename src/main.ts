import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { MercadoLivreService } from './application/services/MercadoLivreService.js';
import { MercadoLivreApiService } from './infrastructure/services/MercadoLivreApiService.js';
import { MercadoLivreToolsController } from './interface/controllers/MercadoLivreToolsController.js';

async function main() {
  const server = new McpServer({
    name: 'mercad-livre',
    version: '1.0.0',
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  const apiService = new MercadoLivreApiService();
  const service = new MercadoLivreService(apiService);

  new MercadoLivreToolsController(server, service);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mercado Livre MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
