import fs from 'fs';

function parseEnum(enumStr: string): { name: string, values: string[] } | null {
  const enumMatch = enumStr.match(/enum (\w+) {([\s\S]*?)}/);
  if (!enumMatch) return null;

  const name = enumMatch[1];
  const values = enumMatch[2].trim().split(/\s+/);

  return { name, values };
}

function parseModel(modelStr: string): { name: string, fields: { name: string, type: string }[] } | null {
  const modelMatch = modelStr.match(/model (\w+) {([\s\S]*?)}/);
  if (!modelMatch) return null;

  const name = modelMatch[1];
  const fields = modelMatch[2]
    .trim()
    .split('\n')
    .map(field => {
      const [fieldName, fieldType] = field.trim().split(/\s+/);
      return { name: fieldName, type: fieldType };
    });

  return { name, fields };
}

function convertToZod(fieldType: string, enums: string[]): string {
  switch (fieldType) {
    case 'String':
      return 'z.string()';
    case 'Int':
      return 'z.number()';
    case 'Boolean':
      return 'z.boolean()';
    default:
      if (enums.includes(fieldType)) {
        return `${fieldType}Enum`;
      }
      return 'z.unknown()';
  }
}

function generateZodSchema(prismaSchema: string): string {
  let zodSchema = "import { z } from 'zod';\n\n";

  const enumMatches = prismaSchema.match(/enum \w+ {[\s\S]*?}/g) || [];
  const modelMatches = prismaSchema.match(/model \w+ {[\s\S]*?}/g) || [];

  const parsedEnums = enumMatches.map(parseEnum).filter(Boolean) as ReturnType<typeof parseEnum>[];
  const parsedModels = modelMatches.map(parseModel).filter(Boolean) as ReturnType<typeof parseModel>[];

  for (const enumData of parsedEnums) {
    if (!enumData) continue;
    zodSchema += `export const ${enumData.name}Enum = z.union([\n  `;
    zodSchema += enumData.values.map(value => `z.literal('${value}')`).join(',\n  ');
    zodSchema += '\n]);\n\n';
  }

  for (const modelData of parsedModels) {
    if (!modelData) continue;
    zodSchema += `export const ${modelData.name}Schema = z.object({\n`;
    for (const field of modelData.fields) {
      zodSchema += `  ${field.name}: ${convertToZod(field.type, parsedEnums.map(e => e.name))},\n`;
    }
    zodSchema += '});\n\n';
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
    console.error("Error generating Zod schema:", error.message);
  }
}

main();
