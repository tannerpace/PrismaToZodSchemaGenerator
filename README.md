# prisma-zodifier

[![npm version](https://img.shields.io/npm/v/prisma-zodifier.svg)](https://www.npmjs.com/package/prisma-zodifier)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`prisma-zodifier` is a utility that facilitates the conversion of Prisma schemas to Zod schemas, providing you with a type-safe schema management solution.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Testing](#testing)
- [License](#license)
- [Contact](#contact)

## Installation

Using npm:

```bash
npm install prisma-zodifier
```

Using yarn:

```bash
yarn add prisma-zodifier
```

## Usage

Once the package is installed, you can run the `prisma-zodifier` command:

```bash
yarn prisma-zodifier
```

By default, `prisma-zodifier` will look for a `schema.prisma` file in the `prisma` directory of your project and generate the Zod schema in the root as `zodSchemas.ts`.

You can also provide custom paths:

```bash
yarn prisma-zodifier path/to/your/prisma/schema.prisma path/to/your/output/zodSchema.ts
```

### Features

- Conversion of Prisma model fields to their respective Zod types.
- Conversion of Prisma enums to Zod unions.
- Type-safe Zod schema generation.
- Sorted Zod schema output.

## Testing

To run the tests:

```bash
yarn test
```

For watch mode:

```bash
yarn test:watch
```

## License

`prisma-zodifier` is available under the MIT license. See the `LICENSE` file for more info.
