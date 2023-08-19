---

# Prisma to Zod Schema Converter

This utility script converts Prisma schemas into Zod validation schemas. By processing the provided Prisma schema (defaulted to `schema.prisma`), it creates a TypeScript file (`zodSchemas.ts` by default) filled with the respective Zod validation schemas.

## Features

- **Model Conversion:** Transforms Prisma model definitions into Zod object schemas.
- **Enum Conversion:** Changes Prisma enum definitions into Zod union schemas.
- **Utility Helpers:** Offers functions for parsing, error-checking, and schema conversion.
- **Organized Output:** The generated Zod schemas are structured in a topological order to manage dependencies aptly.

## Installation

To integrate this package into your project, install directly from npm:

```bash
yarn add prisma-zodifier
```

Or, if you use npm:

```bash
npm i prisma-zodifier
```
