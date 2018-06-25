import { InputBoxShown, InputRecieved, ProduceCompletions } from "./inputBox";
import * as registry from "winreg";
import { exec } from "child_process";

var regKey = new registry({
  hive: registry.HKCU,
  key: '\\Software\\02Credits\\TrafficControl\\Commands'
});

regKey.keyExists((error, exists) => {
  if (!exists) {
    regKey.create((error) => {
      if (error) console.log(error);
      updateSubscriptions();
    })
  } else {
    updateSubscriptions();
  }
});

var subscribedCommands: string[] = [];
function updateSubscriptions() {
  regKey.values((error, values) => {
    if (error) console.log(error);
    else {
      for (var item of values) {
        if (!subscribedCommands.includes(item.name)) {
          subscribedCommands.push(item.name);
          InputRecieved.Subscribe((command) => {
            exec(`${item.value} ${command}`);
          });
          ProduceCompletions.Subscribe((partialInput) => {
            return new Promise((resolve) => {
              exec(`${item.value} complete ${partialInput}`, (error, stdout) => {
                  resolve(stdout);
              })
            });
          });
        }
      }
    }
  });
}

InputBoxShown.Subscribe(updateSubscriptions);
