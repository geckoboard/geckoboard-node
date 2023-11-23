import { version } from '../package.json';
import { fetch, Response } from 'undici';

const USER_AGENT = `Geckoboard Node Client ${version}`;

type ErrorResponse = {
  error?: {
    message?: string;
  };
};

type HTTP_METHOD = 'GET' | 'PUT' | 'POST' | 'DELETE';

type MandatoryField = {
  name: string;
  optional?: false;
};
type OptionalField = {
  name: string;
  optional: true;
};
type Field = MandatoryField | OptionalField;

type DateField = {
  type: 'date';
} & Field;

type DateTimeField = {
  type: 'datetime';
} & Field;

type DurationField = {
  type: 'duration';
  time_unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours';
} & Field;

type CurrencyCode =
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AWG'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BOV'
  | 'BRL'
  | 'BSD'
  | 'BTN'
  | 'BWP'
  | 'BYN'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHE'
  | 'CHF'
  | 'CHW'
  | 'CLF'
  | 'CLP'
  | 'COP'
  | 'COU'
  | 'CRC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'GBP'
  | 'GEL'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRU'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MXV'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIO'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RON'
  | 'RSD'
  | 'CNY'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SLE'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'SSP'
  | 'STN'
  | 'SVC'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'USN'
  | 'UYI'
  | 'UYU'
  | 'UYW'
  | 'UZS'
  | 'VED'
  | 'VES'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XAG'
  | 'XAU'
  | 'XBA'
  | 'XBB'
  | 'XBC'
  | 'XBD'
  | 'XCD'
  | 'XDR'
  | 'XOF'
  | 'XPD'
  | 'XPF'
  | 'XPT'
  | 'XSU'
  | 'XTS'
  | 'XUA'
  | 'XXX'
  | 'YER'
  | 'ZAR'
  | 'ZMW'
  | 'ZWL';
type MoneyField = {
  type: 'money';
  currency_code: CurrencyCode;
} & Field;

type NumberField = {
  type: 'number';
} & Field;

type PercentageField = {
  type: 'percentage';
} & Field;

type StringField = {
  type: 'string';
} & Field;

type Fields = Record<
  string,
  | DateField
  | DateTimeField
  | DurationField
  | MoneyField
  | NumberField
  | PercentageField
  | StringField
>;

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

type Schema<T extends Fields> = {
  id: string;
  fields: T;
  uniqueBy: Array<KeysMatching<T, StringField | DateField | DateTimeField>>;
};

type FieldType<T> = T extends DateField | DateTimeField
  ? string | Date
  : T extends StringField
    ? string
    : T extends DurationField | MoneyField | NumberField | PercentageField
      ? number
      : never;

type IsOptional<
  K extends keyof F,
  F extends Fields,
> = F[K] extends OptionalField ? K : never;
type IsRequired<
  K extends keyof F,
  F extends Fields,
> = F[K] extends OptionalField ? never : K;

type DatasetDataItem<F extends Fields> = {
  [K in keyof F as IsRequired<K, F>]: FieldType<F[K]>;
} & {
  [K in keyof F as IsOptional<K, F>]?: FieldType<F[K]>;
};

class Dataset<T extends Fields> {
  id: string;
  fields: T;
  uniqueBy: Array<KeysMatching<T, StringField | DateField | DateTimeField>>;

  gb: Geckoboard;

  constructor(schema: Schema<T>, gb: Geckoboard) {
    this.id = schema.id;
    this.fields = schema.fields;
    this.uniqueBy = schema.uniqueBy;

    this.gb = gb;
  }

  async create(): Promise<void> {
    const { id, fields, uniqueBy } = this;
    await this.gb.request('PUT', `/datasets/${id}`, {
      fields,
      unique_by: uniqueBy,
    });
  }

  replaceDateObjects(items: DatasetDataItem<T>[]): DatasetDataItem<T>[] {
    const dateFields: Array<keyof T> = [];
    const dateTimeFields: Array<keyof T> = [];

    const keys = Object.keys(this.fields);
    keys.forEach((fieldName) => {
      const field = this.fields[fieldName];
      if (field.type === 'date') {
        dateFields.push(fieldName);
      }
      if (field.type === 'datetime') {
        dateTimeFields.push(fieldName);
      }
    });
    return items.map((item) => {
      dateFields.forEach((fieldName) => {
        const fieldValue = item[fieldName as keyof DatasetDataItem<T>];
        if (fieldValue instanceof Date) {
          item = {
            ...item,
            [fieldName]: fieldValue.toISOString().split('T')[0],
          };
        }
      });
      dateTimeFields.forEach((fieldName) => {
        const fieldValue = item[fieldName as keyof DatasetDataItem<T>];
        if (fieldValue instanceof Date) {
          item = {
            ...item,
            [fieldName]: fieldValue.toISOString(),
          };
        }
      });

      return item;
    });
  }
  async append(items: DatasetDataItem<T>[], deleteBy?: keyof T): Promise<void> {
    const { id } = this;
    const data = this.replaceDateObjects(items);
    await this.gb.request('POST', `/datasets/${id}/data`, {
      data,
      deleteBy,
    });
  }

  async replace(items: DatasetDataItem<T>[]): Promise<void> {
    const { id } = this;
    const data = this.replaceDateObjects(items);
    await this.gb.request('PUT', `/datasets/${id}/data`, {
      data,
    });
  }

  async delete(): Promise<void> {
    const { id } = this;
    await this.gb.request('DELETE', `/datasets/${id}`);
  }
}

export class Geckoboard {
  apiKey: string;
  apiHost: string;
  version: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiHost =
      process.env.GECKOBOARD_API_HOST || 'https://api.geckoboard.com';
    this.version = version;
  }

  async request(
    method: HTTP_METHOD,
    path: string,
    body?: object,
  ): Promise<Response> {
    const auth = btoa(`${this.apiKey}:`);
    const headers = new Headers({
      Authorization: `Basic ${auth}`,
      'User-Agent': USER_AGENT,
    });
    if (method === 'POST' || method === 'PUT') {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(new URL(path, this.apiHost), {
      body: JSON.stringify(body),
      method: method,
      headers,
    });
    if (!res.ok) {
      const json = (await res.json()) as ErrorResponse;
      const message =
        json.error?.message || 'Something went wrong with the request';
      throw new Error(message);
    }
    return res;
  }

  defineDataset<T extends Fields>(schema: Schema<T>): Dataset<T> {
    return new Dataset(schema, this);
  }

  async ping(): Promise<void> {
    await this.request('GET', '/');
  }
}
