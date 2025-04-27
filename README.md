<div align="center">

# Mercado Livre - MCP Server

This project is part of the Model Context Protocol (MCP) ecosystem and provides tools for integrating with external sources and managing specific domain models. It is designed to demonstrate how to build an MCP server that scrapes products from Mercado Livre, with strong data validation to ensure reliability.

</div>

<table style="border-collapse: collapse; width: 100%; table-layout: fixed;">
<tr>
<td style="width: 40%; padding: 15px; vertical-align: middle; border: none;">An integration that enables MCP tools to scrape product data, such as prices and availability, directly from Mercado Livre.</td>
<td style="width: 60%; padding: 0; vertical-align: middle; border: none; min-width: 300px; text-align: center;"><a href="https://glama.ai/mcp/servers/@newerton/mcp-mercado-livre">
  <img style="max-width: 100%; height: auto; min-width: 300px;" src="https://glama.ai/mcp/servers/@newerton/mcp-mercado-livre/badge" alt="Mercado Livre - MCP Server" />
</a></td>
</tr>
</table>

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [MCP Server Configuration in VSCode](#mcp-server-configuration-in-vscode)
- [MCP Server Output in VSCode](#mcp-server-output-in-vscode)
- [Contribution](#contribution)
- [License](#license)

## Features

- **get-produtos**: Fetch basic product information.
- Input validation using [Zod](https://github.com/colinhacks/zod).
- Integration with the Mercado Livre API using `fetch` (infrastructure layer).

## Architecture

The project follows a layered architecture inspired by **Domain-Driven Design** (DDD) patterns:

- **Domain** (`src/domain`):
  Defines interfaces and types that represent data structures (e.g., `Mercado Livre`).

- **Infrastructure** (`src/infrastructure`):
  Implements external services, such as `MercadoLivreApiService`, responsible for making HTTP calls to the Mercado Livre API.

- **Application** (`src/application`):
  Contains business logic in `MercadoLivreService`, which processes and formats data from the infrastructure.

- **Interface** (`src/interface`):
  Includes controllers (`MercadoLivreToolsController`) that register tools in the MCP server, define validation schemas, and return results.

- **Entry Point** (`src/main.ts`):
  Initializes the `McpServer`, configures the transport (`StdioServerTransport`), instantiates services and controllers, and starts listening on _stdio_.

The folder structure is as follows:
```
src/
├── domain/
│   └── models/           # Domain interfaces
├── infrastructure/
│   └── services/         # External API implementations (Mercado Livre)
├── application/
│   └── services/         # Business logic and data formatting
├── interface/
│   └── controllers/      # MCP tool registration and validation
└── main.ts               # Server entry point
build/                    # Compiled JavaScript code
.vscode/                  # Contains the mcp.json file, MCP Server config
```

## Installation

```bash
git clone git@github.com:newerton/mcp-mercado-livre.git
cd mcp-mercado-livre
npm install
npm run build
```

## MCP Server Configuration in VSCode

1. Press `Ctrl+Shift+P` and select "MCP: List Servers"
2. Select "products" and then "Start Server"

## MCP Server Output in VSCode

1. Press `Ctrl+Shift+P` and select "MCP: List Servers"
2. Select "products" and then "Show Output"

## Contribution

Pull requests are welcome! Feel free to open issues and discuss improvements.

## License

This project is licensed under the MIT license - see the [LICENSE](https://github.com/imprvhub/mcp-claude-hackernews/blob/main/LICENSE) file for details.

