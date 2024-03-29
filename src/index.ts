// import path from 'path';


import { convertToZod, isError, isNotNull, parseEnum, parseModel, sortZodSchemas, writeToZodSchemaFile } from './utils/helpers';
function generateZodSchema(prismaSchema: string): string {
  let zodSchema = "import * as z from 'zod';\n\n";

  const enumMatches = prismaSchema.match(/enum \w+ {[\s\S]*?}/g) || [];
  const modelMatches = prismaSchema.match(/model \w+ {[\s\S]*?}/g) || [];

  const parsedEnums = enumMatches.map(parseEnum).filter(isNotNull);
  for (const enumData of parsedEnums) {
    if (!enumData) continue;
    zodSchema += `export const ${enumData.name}Enum = z.union([\n  `;
    zodSchema += enumData.values.map(value => `z.literal('${value}')`).join(',\n  ');
    zodSchema += '\n]);\n\n';
  }
  const parsedModels = modelMatches.map(parseModel).filter(isNotNull);
  for (const modelData of parsedModels) {
    if (!modelData) continue;
    zodSchema += `export const ${modelData.name}Schema = z.object({\n`;

    for (const field of modelData.fields) {
      const fieldType = convertToZod(field.type, parsedEnums.map(e => e.name), parsedModels.map(m => m.name));
      if (fieldType) {
        zodSchema += `  ${field.name}: ${fieldType},\n`;
      }
    }
    zodSchema += '});\n\n';
  }
  return zodSchema;
}
// function getDefaultPrismaSchemaPath(): string {
//   const result = path.join(process.cwd(), 'prisma', 'schema.prisma');
//   console.log(result);
//   return result;
// }

// function getDefaultZodSchemaPath(): string {
//   const result = path.join(process.cwd(), 'endpoint-validation', 'zodSchemas.ts')
//   console.log(result)
//   return result
// }

function main() {
  try {
    const prismaSchema = require('fs').readFileSync('./schema.prisma', 'utf-8');
    const zodSchema = generateZodSchema(prismaSchema);
    const sortedZodSchema = "import * as z from 'zod';\n\n" + sortZodSchemas(zodSchema);
    // Construct the absolute path for zodSchemaOutputPath
    writeToZodSchemaFile(sortedZodSchema);
  } catch (error) {
    if (isError(error)) {
      console.error("conversion error", error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}


main();


export { generateZodSchema, main };


