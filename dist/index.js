"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// package.json
var version = "2.0.0";

// src/index.ts
var Dataset = class {
  constructor(schema) {
    this.id = schema.id;
    this.fields = schema.fields;
    this.uniqueBy = schema.uniqueBy;
  }
  create() {
    const { id, fields, uniqueBy } = this;
    return Promise.resolve({ id, fields, uniqueBy });
  }
  post(items, deleteBy) {
    console.log({ items, deleteBy });
    return Promise.resolve();
  }
  put(items) {
    console.log({ items });
    return Promise.resolve();
  }
  delete() {
    return Promise.resolve();
  }
};
var Geckoboard = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.version = version;
  }
  defineDataset(schema) {
    return new Dataset(schema);
  }
  ping() {
    return Promise.resolve();
  }
};
var src_default = Geckoboard;
//# sourceMappingURL=index.js.map