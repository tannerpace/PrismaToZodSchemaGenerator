const fs = require('fs');


import { generateZodSchema, main } from './prismaToZod';
import { badPath, goodPath, goodSchema, badSchema } from './testHelpers';

describe('Prisma to Zod Conversion', () => {
  beforeAll(() => {
    fs.writeFileSync(goodPath, goodSchema);
    fs.writeFileSync(badPath, badSchema);
  });



  describe('generateZodSchema', () => {
    it('should convert a simple Prisma schema to a Zod schema', () => {
      const goodSchema = fs.readFileSync(goodPath, 'utf8');
      const zodSchema = generateZodSchema(goodSchema);
      expect(zodSchema).toMatchSnapshot();
    });

    it('should throw an error if the Prisma schema is invalid', () => {
      const badSchema = fs.readFileSync(badPath, 'utf8');
      expect(() => generateZodSchema(badSchema)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('main', () => {
    it('should generate a Zod schema file', () => {
      main(goodPath, './testOutput.ts');
      const zodSchema = fs.readFileSync('./testOutput.ts', 'utf8');
      expect(zodSchema).toMatchSnapshot();
      fs.unlinkSync('./testOutput.ts');
    });

    it('should throw an error if the Prisma schema is invalid', () => {
      expect(() => main(badPath, './testOutput.ts')).toThrowErrorMatchingSnapshot();
    });
  });
});

