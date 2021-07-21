const ioHook = require('iohook');
const fs = require('fs');
const readline = require('readline');

ioHook.start(false);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let data = {}

const askForKeySync = () => {
    rl.question("Key ?", wantedKey => {
        if (wantedKey === ':q') {
            fs.writeFileSync("key.json", JSON.stringify(data, null, 4))
            return;
        }

        ioHook.on("keydown", ({ rawcode }) => {
            ioHook.removeAllListeners()
            const newData = {[wantedKey]: rawcode};
            console.log(`Key ${wantedKey} registered with ${rawcode}`)
            data =  {
                ...data,
                ...newData
            }
            askForKeySync()
        })
    })
}

askForKeySync()