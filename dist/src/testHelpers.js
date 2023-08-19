"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badSchema = exports.goodSchema = exports.goodPath = exports.badPath = void 0;
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
exports.goodSchema = goodSchema;
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
exports.badSchema = badSchema;
const goodPath = './good.prisma';
exports.goodPath = goodPath;
const badPath = './bad.prisma';
exports.badPath = badPath;
