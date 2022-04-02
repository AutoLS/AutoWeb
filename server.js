const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/getRandomNum', (req, res) => {
    let num = Math.floor(Math.random() * 100) + 1;
    res.set('content-type', 'text/plain');
    res.send(num.toString());
    res.status(200).end();
    console.log('Generated num: ' + num);
});

app.listen(8080, () => {
    console.log("Listening on port 8080...");
});