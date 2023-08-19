"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const index_1 = require("./index");
const testHelpers_1 = require("./testHelpers");
const helpers_1 = require("./utils/helpers");
describe('Helpers', () => {
    describe('isNotNull', () => {
        it('should return false for null values', () => {
            expect((0, helpers_1.isNotNull)(null)).toBe(false);
        });
        it('should return true for non-null values', () => {
            expect((0, helpers_1.isNotNull)(5)).toBe(true);
        });
    });
    describe('isError', () => {
        it('should return true for Error instances', () => {
            expect((0, helpers_1.isError)(new Error())).toBe(true);
        });
        it('should return false for non-Error values', () => {
            expect((0, helpers_1.isError)("not an error")).toBe(false);
        });
    });
    describe('parseModel', () => {
        it('should correctly parse a Prisma model', () => {
            const modelStr = `
        model User {
          id Int
          name String
          @ignoreThisField
        }
      `;
            const result = (0, helpers_1.parseModel)(modelStr);
            expect(result).toEqual({
                name: 'User',
                fields: [
                    { name: 'id', type: 'Int' },
                    { name: 'name', type: 'String' }
                ]
            });
        });
    });
    describe('parseEnum', () => {
        it('should correctly parse a Prisma enum', () => {
            const enumStr = `
        enum UserRole {
          ADMIN
          USER
        }
      `;
            const result = (0, helpers_1.parseEnum)(enumStr);
            expect(result).toEqual({
                name: 'UserRole',
                values: ['ADMIN', 'USER']
            });
        });
    });
    describe('convertToZod', () => {
        it('should convert basic Prisma types to Zod types', () => {
            expect((0, helpers_1.convertToZod)('String', [], [])).toBe('z.string()');
            expect((0, helpers_1.convertToZod)('Int', [], [])).toBe('z.number()');
        });
        it('should convert enums and models correctly', () => {
            expect((0, helpers_1.convertToZod)('UserRole', ['UserRole'], [])).toBe('UserRoleEnum');
            expect((0, helpers_1.convertToZod)('User', [], ['User'])).toBe('UserSchema');
        });
    });
});
jest.mock('fs');
describe('Prisma to Zod Conversion', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    beforeAll(() => {
        // Mock file system functions
        fs.writeFileSync.mockImplementation(() => { });
        fs.unlinkSync.mockImplementation(() => { });
        fs.readFileSync.mockImplementation((path) => {
            if (path === testHelpers_1.goodPath)
                return testHelpers_1.goodSchema;
            if (path === testHelpers_1.badPath)
                return testHelpers_1.badSchema;
            return null;
        });
        fs.writeFileSync(testHelpers_1.goodPath, testHelpers_1.goodSchema);
        fs.writeFileSync(testHelpers_1.badPath, testHelpers_1.badSchema);
    });
    afterAll(() => {
        fs.unlinkSync(testHelpers_1.goodPath);
        fs.unlinkSync(testHelpers_1.badPath);
    });
    describe('main', () => {
        afterEach(() => {
            try {
                fs.unlinkSync('./testOutput.ts');
            }
            catch (error) { }
        });
        it('should correctly generate a Zod schema file from a valid Prisma schema', () => {
            (0, index_1.main)(testHelpers_1.goodPath, './testOutput.ts');
            const zodSchema = fs.readFileSync('./testOutput.ts', 'utf8');
            expect(zodSchema).toMatchSnapshot();
        });
        it('expect bad should match good after sorting', () => {
            const zodSchema = (0, index_1.generateZodSchema)(testHelpers_1.badSchema);
            const sortedZodSchema = (0, helpers_1.sortZodSchemas)(zodSchema);
            expect(sortedZodSchema).toMatchSnapshot();
        });
    });
});
