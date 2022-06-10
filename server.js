const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const request = require('request')
const async = require('async')
const fs = require('fs')
const ProgressBar = require('progress')

var cors = require('cors');
const { download } = require('express/lib/response');
const app = express()
const port = 3000

app.use(cors());
app.use( bodyParser.json() );

class Downloader {
    constructor() {
        this.q = async.queue(this.singleFile, 1);

        // assign a callback
        this.q.drain(function() {
            console.log('all items have been processed');
        });

        // assign an error callback
        this.q.error(function(err, task) {
            console.error('task experienced an error', task);
        });
    }

    singleFile(fileObj, cb) {
        let file = request(fileObj.url);
        let bar;
        file.on('response', (res) => {
            const len = parseInt(res.headers['content-length'], 10);
            console.log();
            bar = new ProgressBar('  Downloading ' + fileObj.title + ' [:bar] :rate/bps :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 20,
                total: len
            });
            file.on('data', (chunk) => {
                bar.tick(chunk.length);
            })
            file.on('end', () => {
                console.log('\n');
                cb();
            })
        })
        file.pipe(fs.createWriteStream('/hdd/Filme/' + fileObj.title + ".mp4"))
    }
}

const dl = new Downloader();

app.post('/download', (req, res) => {

    if (fs.existsSync(req.body.videoTitle + ".mp4")) {
        return res.send("Dieses Video existiert bereits.");
    }    

    dl.q.push({"title": req.body.videoTitle, "url": req.body.videoSrc});

    res.send("Download gestartet. Es befinden sich aktuell " + dl.q.length() + dl.q.running() + "Downloads in der Queue");
})

app.get('/filesystem', (req, res) => {
    fs.readdir('/', function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 

        let arr = [];
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            arr.push(file); 
        });

        res.send(JSON.stringify(arr));
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})