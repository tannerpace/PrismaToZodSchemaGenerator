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

function parseModel(modelStr: string): Schema | null {
  const modelMatch = modelStr.match(/model (\w+) {([\s\S]*?)}/);
  if (!modelMatch) return null;

  const name = modelMatch[1];
  const fields = modelMatch[2]
    .trim()
    .split('\n')
    .filter(line => !line.trim().startsWith('@') && line.includes(' '))
    .map(field => {
      const [fieldName, fieldType] = field.trim().split(/\s+/);
      if (!fieldName || !fieldType) {
        console.error(`Parsing error with field: "${field}" in model: ${name}`);
        return null;
      }
      return { name: fieldName, type: fieldType };
    }).filter(isNotNull);

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

  // Extract schema names and their content lines
  const schemaContent: { [name: string]: string[] } = {};
  let currentName: string | null = null;

  lines.forEach(line => {
    const match = line.match(/const (\w+)(Enum|Schema) =/);
    if (match) {
      currentName = match[1] + (match[2] || '');
      schemaContent[currentName] = [];
    }

    if (currentName) {
      schemaContent[currentName].push(line);
      if (line.trim().endsWith(');') || line.trim().endsWith(']')) {
        currentName = null;
      }
    }
  });

  const schemaNames = Object.keys(schemaContent);

  // Create a dependency graph
  const graph: { [name: string]: string[] } = {};

  schemaNames.forEach(name => {
    graph[name] = [];
    schemaNames.forEach(depName => {
      if (name !== depName && schemaContent[name].some(l => l.includes(depName))) {
        graph[name].push(depName);
      }
    });
  });

  // Topological sort
  const result: string[] = [];
  const visited: { [name: string]: boolean } = {};
  const visiting: { [name: string]: boolean } = {}; // For detecting cycles

  function visit(name: string) {
    if (visiting[name]) {
      throw new Error(`Cyclic dependency detected at ${name}`);
    }

    if (!visited[name]) {
      visiting[name] = true;
      graph[name].forEach(visit);
      visited[name] = true;
      result.push(name);
      delete visiting[name];
    }
  }

  schemaNames.forEach(name => {
    if (!visited[name]) visit(name);
  });

  return result.map(name => schemaContent[name].join('\n')).join('\n');
}





function generateZodSchema(prismaSchema: string): string {
  let zodSchema = "import { z } from 'zod';\n\n";

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
      zodSchema += `  ${field.name}: ${convertToZod(field.type, parsedEnums.map(e => e.name), parsedModels.map(m => m.name))},\n`;
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
    const sortedZodSchema = sortZodSchemas(zodSchema);
    fs.writeFileSync(zodSchemaOutputPath, sortedZodSchema);
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
