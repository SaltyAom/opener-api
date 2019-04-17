const express = require('express'),
    app = express(),
    cors = require('cors'),
    compression = require('compression'),
    apicache = require('apicache'),
    helmet = require('helmet'),
    Ddos = require('ddos'),
    cache = apicache.middleware,
    Axios = require("axios");

require('now-env');

onDenial = err => {
    console.warn(err);
}

const ddos = new Ddos({
    burst:30, 
    limit:30,
    maxCount:60,
    checkInterval: 5,
    onDenial,
    errormessage: "You have been blocked, UMU",
    whitelist:[
        'https://opener-pro.mystia-project.com',
        'https://opener.mystiar.com',
        'https://h.rariffy.com'
    ]
})

app.use(cors());
app.use(cache('30 minutes'));
app.use(helmet());
app.use(compression());
app.use(ddos.express);

app.get("/api/g", (req, res) => {
    res.json({
        "error": "No id provided",
        "success": false
    })
    res.end();
    return false;
});

app.get("/api/g/:id", async (req, res) => {
    let ogs = require('open-graph-scraper');
    ogs({
        'url': `https://nhentai.net/g/${req.params.id}`
    }, (err, data) => {
        res.json(data);
        res.end();
        return !err;
    });
});

app.get("/api/generate", (req, res) => {
    res.json({
        "success": false,
        "error": "No hexcode provided"
    });
    res.end();
    return false;
});

app.get("/api/generate/:id", async (req, res) => {
    let hexCode = req.params.id,
        hexLength = hexCode.length;

    if(hexLength > 6 && hexLength < 1){
        res.json({
            "success": false,
            "error": "Invaild hex code format",
            dataURL: null
        });
        res.end();
        return false;
    }

    if(hexLength < 6){
        for(let i=hexLength; i<6; i++){
            hexCode += "f"
        }
    }

    let { createCanvas } = require('canvas'),
        canvas = createCanvas(300, 300),
        ctx = canvas.getContext('2d');

    ctx.fillStyle = `#${hexCode}`;
    ctx.fillRect(0, 0, 300, 300);

    let dataURL = canvas.toDataURL();

    res.json({
        "success": true,
        "error": null,
        "dataURL": `${dataURL}`
    });

    return true;
});

app.get("/api/relate", (req, res) => {
    res.json({
        "success": false,
        "error": "No id provided"
    });
    res.end();
    return false;
});

app.get("/api/relate/:id", (req, res) => {
    if(req.params.id.length > 6 && req.params.id.length < 1){
        res.json({
            "success": false,
            "error": "Invaild id format",
            dataURL: null
        });
        res.end();
        return false;
    }

    Axios(`https://nhentai.net/api/gallery/${req.params.id}/related`).then(({data}) => {
        res.json(data);
        res.end();
        return true
    }).catch(err => {
        res.json(err);
    })
});

app.get("*", (req, res) => {
    res.status(404).json({"error": "not found"});
    res.end();
})

const port = process.env.PORT || 4000

app.listen(port, err => {
    if (err) throw err
    console.log(`> Ready On http://localhost:${port} OwO!`)
});