const fs = require("fs");
const { ipcRenderer } = require('electron');
const { Peer } = require('peerjs');
const { io } = require("socket.io-client");
const { typeString } = require("@hurdlegroup/robotjs");


const peerId = 'QN1ZCS';

const socket = io("ws://192.168.5.109:3030", {
    auth: {
        cli_hash: "QN1ZCS",
        cli_nome: "Pizza Delicious",
        cli_tipo: "CLIENTE"
    }
});

const peer = new Peer(peerId, {
    host: "192.168.5.109",
    port: 3030,
    path: "/peer/suporte",
    key: "deelivsuporte",
    debug: 1
});

peer.on('open', (id) => {
	console.log('My peer ID is: ' + id);
});

peer.on('connection', (conn) => {
    conn.on('data', async (data) => {
        if(data[0] == 'connectScreen') {
            const sources = await desktopCapturer.getSources({ types: ['screen'] });
            const displays = await desktopCapturer.getAllDisplays();
            
            await sources.forEach(async (source, i) => {
                const displayInfo = displays.find(display => display.id == source.display_id);

                const constraints = {
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id
                        }
                    }
                }

                const media = await navigator.mediaDevices.getUserMedia(constraints);

                conn.send({
                    displayId: `display-${i}`,
                    primary: (i == 0 ? true : false),
                    displayInfo: JSON.stringify(displayInfo),
                });

                peer.call(data[1], media);
            });
        }

        if(data[0] == 'mouseCtrl') {
            const mouseData = JSON.parse(data[1]);
            const mouseEvent = mouseData['mouseEvent'];
            const mouseWhich = (mouseData['mouseWhich'] == 1 ? 'left' : (mouseData['mouseWhich'] == 2 ? 'middle' : 'right'));
            const mouseX = Math.ceil(mouseData['mouseX']);
            const mouseY = Math.ceil(mouseData['mouseY']);

            if(mouseEvent == 'mousemove') {
                mouseCtrl.mouseMove(mouseX, mouseY);
            }

            if(mouseEvent == 'mousedown' || mouseEvent == 'mouseup') {
                mouseCtrl.mouseToggle((mouseEvent == 'mousedown' ? 'down' : 'up'), mouseWhich);
            }

            if(mouseEvent == 'wheel') {
                mouseCtrl.mouseWheel(mouseData['mouseWheelX'], mouseData['mouseWheelY']);
            }
        }

        if(data[0] == 'keyboardCtrl') {
            const keyData = JSON.parse(data[1]);
            const keyEvent = keyData['keyEvent'];
            const keyCode = keyData['keyCode'];
            
            if(keyEvent == 'keydown' || keyEvent == 'keyup')
                if(
                    keyCode == '/' ||
                    keyCode == '?' ||
                    keyCode == 'ã' ||
                    keyCode == 'â' ||
                    keyCode == 'õ' ||
                    keyCode == 'ô' ||
                    keyCode == 'é' ||
                    keyCode == 'è'
                ) {
                    if(keyEvent == 'keydown')
                        keyboardCtrl.typeString(keyCode);
                    return;
                }
                
                keyboardCtrl.keyToggle(keyCode, (keyEvent == 'keydown' ? 'down' : 'up'));
        }
    });
})


// IPC RENDERER
const desktopCapturer = {
    getSources: (opts) => ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts),
    getAllDisplays: () => ipcRenderer.invoke('SCREEN_GET_ALL_DISPLAYS')
}

const mouseCtrl = {
    mouseMove: (x, y) => ipcRenderer.invoke('MOUSE_MOVE', x, y),
    mouseToggle: (down, which) => ipcRenderer.invoke('MOUSE_TOGGLE', down, which),
    mouseWheel: (wheelX, wheelY) => ipcRenderer.invoke('SCROLL_MOUSE', wheelX, wheelY)
}

const keyboardCtrl = {
    keyToggle: (key, down) => ipcRenderer.invoke('KEY_TOGGLE', key, down),
    typeString: (key, down) => ipcRenderer.invoke('TYPE_STRING', key)
}