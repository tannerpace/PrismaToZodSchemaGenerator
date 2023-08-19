const fs = require('fs');
import { generateZodSchema, main } from './prismaToZod';
import { badPath, goodPath, goodSchema, badSchema } from './testHelpers';
import { isNotNull, isError, parseModel, parseEnum, convertToZod, sortZodSchemas } from './utils/helpers';

describe('Helpers', () => {

  describe('isNotNull', () => {
    it('should return false for null values', () => {
      expect(isNotNull(null)).toBe(false);
    });

    it('should return true for non-null values', () => {
      expect(isNotNull(5)).toBe(true);
    });
  });

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error())).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError("not an error")).toBe(false);
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

      const result = parseModel(modelStr);
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

      const result = parseEnum(enumStr);
      expect(result).toEqual({
        name: 'UserRole',
        values: ['ADMIN', 'USER']
      });
    });
  });

  describe('convertToZod', () => {
    it('should convert basic Prisma types to Zod types', () => {
      expect(convertToZod('String', [], [])).toBe('z.string()');
      expect(convertToZod('Int', [], [])).toBe('z.number()');
    });

    it('should convert enums and models correctly', () => {
      expect(convertToZod('UserRole', ['UserRole'], [])).toBe('UserRoleEnum');
      expect(convertToZod('User', [], ['User'])).toBe('UserSchema');
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
    fs.readFileSync.mockImplementation(path => {
      if (path === goodPath) return goodSchema;
      if (path === badPath) return badSchema;
      return null;
    });


    fs.writeFileSync(goodPath, goodSchema);
    fs.writeFileSync(badPath, badSchema);
  });

  afterAll(() => {

    fs.unlinkSync(goodPath);
    fs.unlinkSync(badPath);
  });



  describe('main', () => {
    afterEach(() => {
      try {
        fs.unlinkSync('./testOutput.ts');
      } catch (error) { }
    });

    it('should correctly generate a Zod schema file from a valid Prisma schema', () => {
      main(goodPath, './testOutput.ts');
      const zodSchema = fs.readFileSync('./testOutput.ts', 'utf8');
      expect(zodSchema).toMatchSnapshot();
    });


    it('expect bad should match good after sorting', () => {
      const zodSchema = generateZodSchema(badSchema);
      const sortedZodSchema = sortZodSchemas(zodSchema);
      expect(sortedZodSchema).toMatchSnapshot();
    }
    );
  });
});
