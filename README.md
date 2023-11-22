# geckoboard-node

> **For users of the deprecated custom widget library**
>
> You should pin your `package.json` to version `0.0.9` of this module to ensure that your code continues to work.
>
> `npm install geckoboard@0.0.9 --save`

## Installation

```
npm install geckoboard
```

## Use

The latest documentation and user guide can be found on the Geckoboard developer docs (https://developer.geckoboard.com/) 


### API requests

#### Find or create a new dataset

```
import { Geckoboard } from 'geckoboard';

const API_KEY = 'YOUR_API_KEY';

const gb = new Geckoboard(API_KEY);

const dataset = gb.defineDataset({
  id: 'my.dataset',
  fields: {
    count: {
      type: 'number',
      name: 'Count',
    },
    day: {
      type: 'date',
      name: 'Day',
    },
    timestamp: {
      type: 'datetime',
      name: 'Timestamp',
    },
  },
  uniqueBy: ['day'],
});

await dataset.create();
```

#### Update a dataset
```

await dataset.append([
  { count: 1, day: '2023-10-10' },
  { count: 2, day: '2023-10-11' },
  { count: 3, day: '2023-10-12' },
  { count: 4, day: '2023-10-13' },
]);

// provide an optional 'delete_by' value, to indicate 
// which fields should be used to indicate which records
// should be deleted
await dataset.append([{ count: 3, day: '2023-10-11' }], 'day')
```

#### Replace all data in a dataset
```
// all current data will be replaced
await dataset.replace([{ count: 2, day: '2023-10-10' }])

```
#### Delete a dataset
```

// remove the dataset completely
await dataset.delete()

```

#### Using Date objects to send date/datetime field values
```
await dataset.append([
  { count: 1, day: new Date('2023-10-10T12:00:00Z') },
  { count: 2, day: new Date('2023-10-11T12:00:00Z') },
  { count: 3, day: new Date('2023-10-12T12:00:00Z') },
  { count: 4, day: new Date('2023-10-13T12:00:00Z') },
]);
```

This will store the respective dataset field values as whatever the UTC value of the given Date object is.

```
// be careful with timezones, the date that is sent to the server
// will be the UTC value of the given date.
await dataset.append([
  {
    timestamp: new Date('2018-01-01T12:00:00'), 
    // If local timezone is GMT, this will map to '2018-01-01T12:00:00.000Z'
    // If local time zone is `Europe/Paris` (UTC + 1), this will map to
    // 2018-01-01T11:00:00.000Z
    steps: 819,
  },
]);

// local time will be changed to UTC
await dataset.append([
  {
    timestamp: new Date('2018-01-01T12:00'), // local time maps to UTC
    // so for example, if you're in `Europe/Paris` (UTC + 1) this will be
    // '2018-01-01T11:00:00.000Z' -  it changes 12 noon back to 11am.
    steps: 819,
  },
]);

// dates with non-UTC timezone
await dataset.append([
  {
    timestamp: new Date('2013-09-15T05:53:00+08:00'),
    // UTC + 8 time maps to UTC. So, this will map to
    // '2013-09-14T21:53:00.000Z' -  it goes back 8 hours, and changes
    // the day, if necessary.
    steps: 819,
  },
]);

// date strings are always interpreted as UTC
// this is a quirk in the Javascript spec
await dataset.append([
  {
    timestamp: ...,
    day: new Date('2013-09-15'),
    // will always map to '2013-09-15'
    // regardless of your timezone.
    steps: 819,
  },
]);

```

### Ping to test connection

```
import { Geckoboard } from 'geckoboard';

const API_KEY = 'YOUR_API_KEY';

const gb = new Geckoboard(API_KEY);

try {
  await gb.ping()
  console.log("success")
} catch (err) {
  console.log(err); 
}
```
## Running the tests

```
npm run test
```

## Development

You can change the host against which requests will be made by setting the `GECKOBOARD_API_HOST` environment variable to the full URL of the instance you wish to use.

## Notes for maintainers

To publish a new version of the module to NPM, you need to run the following command
```
npm version X.X.X
```
Where X.X.X is the version you want to release. This will create a tagged commit, once this commit is pushed to github, it will trigger publishing to NPM.
