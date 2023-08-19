const fs = require('fs');

import { generateZodSchema, main } from './prismaToZod';
import { sortZodSchemas } from './utils/helpers';
import { badPath, goodPath, goodSchema, badSchema } from './testHelpers';


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
