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
export {
  src_default as default
};
//# sourceMappingURL=index.mjs.map