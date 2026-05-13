const fs = require('fs');
const path = require('path');
const sizeOf = (file) => {
    const b = fs.readFileSync(file);
    // Simple PNG size parser
    if (b.toString('ascii', 1, 4) === 'PNG') {
        return {
            width: b.readInt32BE(16),
            height: b.readInt32BE(20)
        };
    }
    return null;
};
console.log(sizeOf('public/screenshots/tablet1.png'));
console.log(sizeOf('public/screenshots/tablet2.png'));
console.log(sizeOf('public/screenshots/tablet3.png'));
