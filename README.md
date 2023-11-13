# geckoboard-node

This module requires Node v4 or greater.

> **For users of the deprecated custom widget library**

> You should pin your `package.json` to version `0.0.9` of this module to ensure that your code continues to work.

> `npm install geckoboard@0.0.9 --save`

> [Find out more about the new Geckoboard Datasets API](https://community.geckoboard.com/t/help-test-geckoboards-new-approach-to-custom-widgets/179)

## Installation

```
npm install geckoboard
```

## Use

The latest documentation and user guide can be found on the Geckoboard developer docs (https://developer.geckoboard.com/) 


### API requests

#### Find or create a new dataset

```
import Geckoboard from 'geckoboard';

const API_KEY = 'YOUR_API_KEY';

const gb = new Geckoboard(API_KEY);

const dataset = gb.defineDataset({
    id: 'my.dataset',
    fields: {
        count: {
            type: 'number',
            name: 'Count'
        },
        day: {
            type: 'date',
            name: 'Day'
        },
    },
    uniqueBy: ['day']
})

const schema = await dataset.create();
console.log(schema)
```

#### Update a dataset
```

await dataset.post([{ count: 1, day: '2023-10-10' }])

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

### Ping to test connection

```
import Geckoboard from 'geckoboard';

const API_KEY = 'YOUR_API_KEY';

const gb = new Geckoboard(API_KEY);

const run = async (): Promise<void> => {
    console.log(await gb.ping());
}

try {
  run()
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
