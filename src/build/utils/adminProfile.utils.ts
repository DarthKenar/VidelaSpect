const fs = require('fs');

export const getListFileNamesOnDir = (dirPath: string): string[] => {
    //https://www.geeksforgeeks.org/node-js-fs-readdirsync-method/
    try {
        let filenamesList = fs.readdirSync(dirPath);
        return filenamesList;
    } catch (err) {
        console.error(err);
        return [];
    }
}
