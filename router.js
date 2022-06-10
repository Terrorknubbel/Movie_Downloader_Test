var express = require('express');
var router = express.Router();

const request = require('request')
const async = require('async')
const fs = require('fs')
const ProgressBar = require('progress')

// let DOWNLOAD_PATH = "./";
let DOWNLOAD_PATH = "/hdd/Filme/";

class Downloader {
    constructor() {
        this.q = async.queue(this.singleFile, 1);

        //callback
        this.q.drain(function() {
            console.log('all items have been processed');
        });

        //error callback
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
        file.pipe(fs.createWriteStream(DOWNLOAD_PATH + fileObj.title + ".mp4"))
    }
}

const dl = new Downloader();

router.get('/queue', (req, res) => {
    console.log(dl.q.workersList());
    for (let item of dl.q) {
        console.log(item)
    }
    res.send();
})

router.post('/download', (req, res) => {

    if (fs.existsSync(req.body.videoTitle + ".mp4")) {
        return res.send("Dieses Video existiert bereits.");
    }    

    dl.q.push({"title": req.body.videoTitle, "url": req.body.videoSrc});

    let queue_length = parseInt(dl.q.length());
    let queue_running = parseInt(dl.q.running());
    let queue_length_all = queue_length + queue_running;

    if(queue_length_all === 1){
        res.send("Download gestartet. Es befindet sich aktuell 1 Download in der Queue");
    }else{
        res.send("Download gestartet. Es befinden sich aktuell " + queue_length_all + "Downloads in der Queue");
    }
})

module.exports = router;