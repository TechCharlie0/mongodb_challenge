const express = require("express");
const app = express();
const port = 3000;
const bcrypt = require("bcrypt");

app.get("/", (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash("myPassword", salt, (err, hash) => {
            console.log(hash);
        });
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
//$2b$10$ARfuX2pQy.iFv0S8tBlBTOI3b1.GP.nlU1TsHuyYe/.TCIzZqDgA2
//myPassword