const fs = require("fs");

function readFile(fileName, callback) {
    fs.readFile(fileName, "utf8", function(err, data){
        if (err) {
            callback(err, null);
        } else {
            try {
                const jsonData = JSON.parse(data);
                const { abi } = jsonData;
                callback(null, abi);
            } catch (err) {
                callback(err, null);
            }
        }
    });
}

module.exports = {
    readFile
};