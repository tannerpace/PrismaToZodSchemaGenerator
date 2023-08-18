import fs from 'fs';
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

export {
  isNotNull,
  isError,
  parseModel,
  parseEnum,
  convertToZod,
}