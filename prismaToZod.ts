import fs from 'fs';


import { isNotNull, isError, parseModel, parseEnum, convertToZod } from './utils/helpers';
function generateZodSchema(prismaSchema: string): string {
  let zodSchema = "import { z } from 'zod';\n\n";

  const enumMatches = prismaSchema.match(/enum \w+ {[\s\S]*?}/g) || [];
  const modelMatches = prismaSchema.match(/model \w+ {[\s\S]*?}/g) || [];


  const parsedModels = modelMatches.map(parseModel).filter(isNotNull);
  const parsedEnums = enumMatches.map(parseEnum).filter(isNotNull);
  for (const modelData of parsedModels) {
    if (!modelData) continue;
    zodSchema += `export const ${modelData.name}Schema = z.object({\n`;
    for (const field of modelData.fields) {
      zodSchema += `  ${field.name}: ${convertToZod(field.type, parsedEnums.map(e => e.name), parsedModels.map(m => m.name))},\n`;

    }
    zodSchema += '});\n\n';
  }

  for (const enumData of parsedEnums) {
    if (!enumData) continue;
    zodSchema += `export const ${enumData.name}Enum = z.union([\n  `;
    zodSchema += enumData.values.map(value => `z.literal('${value}')`).join(',\n  ');
    zodSchema += '\n]);\n\n';
  }
  return zodSchema;
}

function main() {
  const prismaSchemaPath = './schema.prisma';
  const zodSchemaOutputPath = './zodSchemas.ts';

  try {
    const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
    const zodSchema = generateZodSchema(prismaSchema);

    fs.writeFileSync(zodSchemaOutputPath, zodSchema);
    console.log(`Zod schema generated as ${zodSchemaOutputPath}`);
  } catch (error) {
    if (isError(error)) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}

main();
