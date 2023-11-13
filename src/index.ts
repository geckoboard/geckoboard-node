import { version } from '../package.json';

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

type FieldType<T> = T extends DateField | DateTimeField | StringField
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

  constructor(schema: Schema<T>) {
    this.id = schema.id;
    this.fields = schema.fields;
    this.uniqueBy = schema.uniqueBy;
  }

  create(): Promise<Schema<T>> {
    const { id, fields, uniqueBy } = this;
    return Promise.resolve({ id, fields, uniqueBy });
  }

  append(items: DatasetDataItem<T>[], deleteBy?: keyof T): Promise<void> {
    console.log({ items, deleteBy });
    return Promise.resolve();
  }

  replace(items: DatasetDataItem<T>[]): Promise<void> {
    console.log({ items });
    return Promise.resolve();
  }

  delete(): Promise<void> {
    return Promise.resolve();
  }
}

class Geckoboard {
  apiKey: string;
  version: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.version = version;
  }

  defineDataset<T extends Fields>(schema: Schema<T>): Dataset<T> {
    return new Dataset(schema);
  }

  ping(): Promise<void> {
    return Promise.resolve();
  }
}

export default Geckoboard;
