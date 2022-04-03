const express = require('express');
const path = require('path');
const app = express();

const logger = (req, res, next) =>
{
    const currentDate = new Date();
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl} ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`);
    next();
}

app.use(logger);

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