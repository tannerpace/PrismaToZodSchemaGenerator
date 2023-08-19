# Prisma to Zod Schema Converter

This repository contains a utility script to convert Prisma schemas into Zod validation schemas. It processes the provided Prisma schema (`schema.prisma` by default) and generates a TypeScript file (`zodSchemas.ts` by default) containing Zod validation schemas.

## Features

1. Convert Prisma model definitions to Zod object schemas.
2. Convert Prisma enum definitions to Zod union schemas.
3. Provides helper functions for parsing, error checking, and schema conversion.
4. Organizes the generated Zod schemas in topological order to handle dependencies correctly.

## Installation

1. Clone the repository to your local machine.

   ```bash
   git clone https://github.com/tannerpace/PrismaToZodSchemaGenerator
   ```

2. Change to the project directory:

   ```bash
   cd path/to/PrismaToZodSchemaGenerator
   ```

3. Install the required dependencies:
   ```bash
   yarn install
   ```

## Dependencies

- Development:

  - [@types/node](https://www.npmjs.com/package/@types/node): Provides TypeScript definitions for Node.js.

- Runtime:
  - [ts-node](https://www.npmjs.com/package/ts-node): Enables TypeScript execution and REPL for Node.js.
  - [typescript](https://www.npmjs.com/package/typescript): A language for application-scale JavaScript development.
  - [zod](https://www.npmjs.com/package/zod): A runtime validation library for JavaScript and TypeScript.

## How to Use

1. Place your Prisma schema file (`schema.prisma`) in the root directory.
2. Run the main script using:
   ```bash
   npx prismaToZod.ts
   ```
3. Check the generated `zodSchemas.ts` file for your Zod validation schemas.

## Helper Functions

The helper functions serve different purposes:

1. `isNotNull` - Checks if a value is not null.
2. `isError` - Determines if an object is an instance of the Error class.
3. `parseModel` - Parses a Prisma model definition string and extracts its name and fields.
4. `parseEnum` - Parses a Prisma enum definition string and extracts its name and values.
5. `convertToZod` - Converts a Prisma type to its corresponding Zod type.
6. `sortZodSchemas` - Orders Zod schemas topologically based on their dependencies to ensure valid TypeScript code.

## Tests

The test suite uses [Jest](https://jestjs.io/) and can be run using:

```bash
yarn test
```

- The script does has been tested with Prisma schema files that contain multiple models and enums.

## Contributing

Contributions are welcome! If you find a bug or have suggestions for improvements, please open an issue or submit a pull request.

## License

[MIT License](LICENSE)

---
