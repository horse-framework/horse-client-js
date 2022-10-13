import { HorseClient } from './horse-client';

let client = new HorseClient();

client.addRemoteHost('horse://localhost:15400');
client.onlog.subscribe(log => {
    console.log('LOG: ' + log);
});

client.connect();
client.onconnected.subscribe(() => {
    client.queue.create('NodeQueue1', { type: 'round-robin', managerName: 'persistent' })
        .subscribe(result => {
            console.log('Queue Create Result is ' + result.code);
        });
});