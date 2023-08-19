"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.generateZodSchema = void 0;
const helpers_1 = require("./utils/helpers");
function generateZodSchema(prismaSchema) {
    let zodSchema = "import * as z from 'zod';\n\n";
    const enumMatches = prismaSchema.match(/enum \w+ {[\s\S]*?}/g) || [];
    const modelMatches = prismaSchema.match(/model \w+ {[\s\S]*?}/g) || [];
    const parsedEnums = enumMatches.map(helpers_1.parseEnum).filter(helpers_1.isNotNull);
    for (const enumData of parsedEnums) {
        if (!enumData)
            continue;
        zodSchema += `export const ${enumData.name}Enum = z.union([\n  `;
        zodSchema += enumData.values.map(value => `z.literal('${value}')`).join(',\n  ');
        zodSchema += '\n]);\n\n';
    }
    const parsedModels = modelMatches.map(helpers_1.parseModel).filter(helpers_1.isNotNull);
    for (const modelData of parsedModels) {
        if (!modelData)
            continue;
        zodSchema += `export const ${modelData.name}Schema = z.object({\n`;
        for (const field of modelData.fields) {
            const fieldType = (0, helpers_1.convertToZod)(field.type, parsedEnums.map(e => e.name), parsedModels.map(m => m.name));
            if (fieldType) {
                zodSchema += `  ${field.name}: ${fieldType},\n`;
            }
        }
        zodSchema += '});\n\n';
    }
    return zodSchema;
}
exports.generateZodSchema = generateZodSchema;
function main(prismaSchemaPath = './schema.prisma', zodSchemaOutputPath = './zodSchemas.ts') {
    try {
        const prismaSchema = require('fs').readFileSync(prismaSchemaPath, 'utf-8');
        const zodSchema = generateZodSchema(prismaSchema);
        const sortedZodSchema = "import * as z from 'zod';\n\n" + (0, helpers_1.sortZodSchemas)(zodSchema);
        (0, helpers_1.writeToZodSchemaFile)(sortedZodSchema, zodSchemaOutputPath);
    }
    catch (error) {
        if ((0, helpers_1.isError)(error)) {
            console.error("conversion error", error.message);
        }
        else {
            console.error("An unknown error occurred");
        }
    }
}
exports.main = main;
const args = process.argv.slice(2);
const prismaSchemaPath = args[0] || './schema.prisma';
const zodSchemaOutputPath = args[1] || './zodSchemas.ts';
main(prismaSchemaPath, zodSchemaOutputPath);
