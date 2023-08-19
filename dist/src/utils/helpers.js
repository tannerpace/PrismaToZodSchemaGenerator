"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToZodSchemaFile = exports.sortZodSchemas = exports.convertToZod = exports.parseEnum = exports.parseModel = exports.isError = exports.isNotNull = void 0;
const fs_1 = __importDefault(require("fs"));
function isNotNull(value) {
    return value !== null;
}
exports.isNotNull = isNotNull;
function isError(err) {
    return err instanceof Error;
}
exports.isError = isError;
function parseModel(modelStr) {
    const modelMatch = modelStr.match(/model (\w+) {([\s\S]*?)}/);
    if (!modelMatch)
        return null;
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
exports.parseModel = parseModel;
function parseEnum(enumStr) {
    const enumMatch = enumStr.match(/enum (\w+) {([\s\S]*?)}/);
    if (!enumMatch)
        return null;
    const name = enumMatch[1];
    const values = enumMatch[2].trim().split(/\s+/);
    return { name, values };
}
exports.parseEnum = parseEnum;
function convertToZod(fieldType, enums, models) {
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
            return '';
    }
}
exports.convertToZod = convertToZod;
function sortZodSchemas(zodSchema) {
    const lines = zodSchema.split('\n');
    // Extracts schema names and their content lines
    const schemaContent = {};
    let currentName = null;
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
    const graph = {};
    schemaNames.forEach(name => {
        graph[name] = [];
        schemaNames.forEach(depName => {
            if (name !== depName && schemaContent[name].some(l => l.includes(depName))) {
                graph[name].push(depName);
            }
        });
    });
    // Topological sort
    const result = [];
    const visited = {};
    const visiting = {}; // For detecting cycles
    function visit(name) {
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
        if (!visited[name])
            visit(name);
    });
    return result.map(name => schemaContent[name].join('\n')).join('\n');
}
exports.sortZodSchemas = sortZodSchemas;
function writeToZodSchemaFile(zodSchema, zodSchemaOutputPath = './zodSchemas.ts') {
    fs_1.default.writeFileSync(zodSchemaOutputPath, zodSchema);
    console.log(`Zod schema generated as ${zodSchemaOutputPath}`);
}
exports.writeToZodSchemaFile = writeToZodSchemaFile;
