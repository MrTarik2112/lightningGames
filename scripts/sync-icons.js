const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');

console.log(`Syncing icons: ${pngPath} -> ${icoPath}`);

pngToIco(pngPath)
    .then(buffer => {
        fs.writeFileSync(icoPath, buffer);
        console.log('Successfully created assets/icon.ico');
    })
    .catch(error => {
        console.error('Error creating ico file:', error);
        process.exit(1);
    });
