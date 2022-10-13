# horse-client-js

NodeJS Client for Horse Messaging Server

### Installation ###

```
npm i horse-client-js
```

### Sample Usage ###

```js
import { HorseClient } from './horse-client';

let client = new HorseClient();
client.addRemoteHost('horse://localhost:15400');
client.onlog.subscribe(log => {
    console.log('LOG: ' + log);
});

client.queue.subscribe('queue-name')
    .subscribe(context => {
        console.log('consumed', context.message);
    });

client.connect();
```
