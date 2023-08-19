
const goodSchema = `
  enum UserRole {
    ADMIN
    USER
  }
  
  model User {
    id    Int    @id
    name  String
    role  UserRole
  }`;


const badSchema = `
  model User {
    id    Int    @id
    name  String
    role  UserRole
  }

  enum UserRole {
    ADMIN
    USER
  }`;

const goodPath = './good.prisma';
const badPath = './bad.prisma';
export { badPath, goodPath, goodSchema, badSchema };