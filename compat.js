// @ts-check
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const Geckoboard = require('.').default;
import { version } from './package.json';

/**
 * @param {string} apiKey
 */
function gb(apiKey) {
  const client = new Geckoboard(apiKey);
  return {
    ping(cb) {
      client.ping().then(() => cb(), cb);
    },
    datasets: {
      findOrCreate(datasetMeta, cb) {
        const dataset = client.defineDataset(datasetMeta);
        dataset.create().then(
          () =>
            cb(null, {
              id: dataset.id,
              put(data, cb) {
                dataset.replace(data).then(() => cb(), cb);
              },
              post(data, options, cb) {
                const deleteBy = options ? options.delete_by : undefined;
                dataset.append(data, deleteBy).then(() => cb(), cb);
              },
              delete(cb) {
                dataset.delete().then(() => cb(), cb);
              },
            }),
          (err) => cb(err),
        );
      },
      delete(id, cb) {
        const dataset = client.defineDataset({ id, fields: {}, uniqueBy: [] });
        dataset.delete().then(() => cb(), cb);
      },
    },
  };
}

gb.VERSION = version;

module.exports = gb;
