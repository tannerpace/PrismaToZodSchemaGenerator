import fs from 'fs';

type Schema = {
  name: string;
  fields: { name: string, type: string }[];
};

type Enum = {
  name: string;
  values: string[];
};

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function isError(err: unknown): err is Error {
  return err instanceof Error;
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


function parseEnum(enumStr: string): { name: string, values: string[] } | null {
  const enumMatch = enumStr.match(/enum (\w+) {([\s\S]*?)}/);
  if (!enumMatch) return null;
  const name = enumMatch[1];
  const values = enumMatch[2].trim().split(/\s+/);
  return { name, values };
}




function convertToZod(fieldType: string, enums: string[], models: string[]): string {
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
      if (models.includes(fieldType)) {
        return `${fieldType}Schema`;
      }
      return 'z.unknown()';
  }
}

function sortZodSchemas(zodSchema: string): string {
  const lines = zodSchema.split('\n');


  const schemaLines: { [name: string]: string } = {};
  lines.forEach(line => {
    const match = line.match(/const (\w+)Schema =/);
    if (match) {
      schemaLines[match[1]] = line;
    }
  });

  const schemaNames = Object.keys(schemaLines);

  // Build dependency graph
  const graph: { [name: string]: string[] } = {};
  schemaNames.forEach(name => {
    graph[name] = [];
    schemaNames.forEach(depName => {
      if (name !== depName && schemaLines[name].includes(`${depName}Schema`)) {
        graph[name].push(depName);
      }
    });
  });

  // Topological sort
  const result: string[] = [];
  const visited: { [name: string]: boolean } = {};

  function visit(name: string) {
    if (!visited[name]) {
      visited[name] = true;
      graph[name].forEach(visit);
      result.push(name);
    }
  }
  schemaNames.forEach(visit);
  return result.map(name => schemaLines[name]).join('\n');
}




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
  const unSortedzodSchemaOutputPath = './unSortedZodSchemas.ts';


  try {
    const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
    const zodSchema = generateZodSchema(prismaSchema);
    const orderedSchema = sortZodSchemas(zodSchema);
    fs.writeFileSync(zodSchemaOutputPath, orderedSchema);
    console.log(`Zod schema generated as ${zodSchemaOutputPath}`);
  } catch (error) {
    if (isError(error)) {

      console.error("conversion error", error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}

main();
