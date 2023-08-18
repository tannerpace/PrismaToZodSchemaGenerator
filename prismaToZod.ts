import fs from 'fs';

function parseEnum(enumStr: string): { name: string, values: string[] } | null {
  const enumMatch = enumStr.match(/enum (\w+) {([\s\S]*?)}/);
  if (!enumMatch) return null;

  const name = enumMatch[1];
  const values = enumMatch[2].trim().split(/\s+/);

  return { name, values };
}

function parseModel(modelStr: string): { name: string, fields: string[] } | null {
  const modelMatch = modelStr.match(/model (\w+) {([\s\S]*?)}/);
  if (!modelMatch) return null;

  const name = modelMatch[1];
  const fields = modelMatch[2].trim().split('\n').map(field => field.trim());

  return { name, fields };
}

function generateZodSchema(prismaSchema: string) {
  let zodSchema = "import { z } from 'zod';\n\n";

  // Extract enums and models
  const enums = prismaSchema.match(/enum \w+ {[\s\S]*?}/g) || [];
  const models = prismaSchema.match(/model \w+ {[\s\S]*?}/g) || [];

  for (const enumStr of enums) {
    const enumData = parseEnum(enumStr);
    if (enumData) {
      zodSchema += `export const ${enumData.name}Enum = z.union([\n  `;
      zodSchema += enumData.values.map(value => `z.literal('${value}')`).join(',\n  ');
      zodSchema += '\n]);\n\n';
    }
  }

  for (const modelStr of models) {
    const modelData = parseModel(modelStr);
    if (modelData) {
      zodSchema += `export const ${modelData.name}Schema = z.object({\n`;
      for (const field of modelData.fields) {
        const [fieldName, fieldType] = field.split(/\s+/);
        switch (fieldType) {
          case 'String':
            zodSchema += `  ${fieldName}: z.string(),\n`;
            break;
          case 'Int':
            zodSchema += `  ${fieldName}: z.number(),\n`;
            break;
          case 'Boolean':
            zodSchema += `  ${fieldName}: z.boolean(),\n`;
            break;
          default:
            if (enums.includes(fieldType)) {
              zodSchema += `  ${fieldName}: ${fieldType}Enum,\n`;
            }
            break;
        }
      }
      zodSchema += '});\n\n';
    }
  }

  return zodSchema;
}

const prismaSchemaPath = './schema.prisma';
const zodSchemaOutputPath = './zodSchemas.ts';

const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
const zodSchema = generateZodSchema(prismaSchema);

fs.writeFileSync(zodSchemaOutputPath, zodSchema);
console.log(`Zod schema generated as ${zodSchemaOutputPath}`);
