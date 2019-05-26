const express = require('express'),
    app = express(),
    cors = require('cors'),
    compression = require('compression'),
    apicache = require('apicache'),
    helmet = require('helmet'),
    Ddos = require('ddos'),
    cache = apicache.middleware,
    queue = require('express-queue'),
    axios = require("axios"),
    { setupCache } = require("axios-cache-adapter");

require('now-env');

const axiosCache = setupCache({
    maxAge: 604800
});

const Axios = axios.create({
    adapter: axiosCache.adapter
});

onDenial = err => {
    console.warn(err);
}

const ddos = new Ddos({
    burst:30,
    limit:30,
    maxCount:80,
    checkInterval: 7,
    onDenial,
    errormessage: "You have been blocked due to attempted DOS, UMU",
    whitelist:[
        'https://opener-pro.mystia-project.com',
        'https://opener.mystiar.com',
        'https://h.rariffy.com'
    ]
})

app.use(ddos.express);
app.use(cache('1 hour'));
app.use(queue({ activeLimit: 7, queuedLimit: -1 }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        data: "API usage list is at https://api.opener.mystiar.com",
        success: true
    })
});

app.get("/api/g", (req, res) => {
    res.status(401).json({
        "error": "No id provided",
        "description": "Correct syntax is /api/g/:id",
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

app.get("/api/og/:id", async (req, res) => {
    let ogs = require('open-graph-scraper');
    ogs({
        'url': `https://nhentai.net/g/${req.params.id}`
    }, (err, data) => {
        res.json(data);
        res.end();
        return !err;
    });
});

app.get("/api/opengraph/:id", async (req, res) => {
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
    res.status(401).json({
        "success": false,
        "description": "Correct syntax is /api/generate/:id",
        "error": "No hexcode provided"
    });
    res.end();
    return false;
});

app.get("/api/generate/:id", async (req, res) => {
    let hexCode = req.params.id,
        hexLength = hexCode.length;

    if(hexLength > 6 && hexLength < 1){
        res.status(401).json({
            "success": false,
            "error": "Invaild hex code format",
            "description": "Correct syntax is /api/generate/:id",
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
    res.status(401).json({
        "success": false,
        "description": "Correct syntax is /api/relate/:id",
        "error": "No id provided"
    });
    res.end();
    return false;
});

app.get("/api/relate/:id", (req, res) => {
    if(req.params.id.length > 6 && req.params.id.length < 1){
        console.log("RELATED FAILED");
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end();
        return;
    }

    Axios.get(`https://nhentai.net/api/gallery/${req.params.id}/related`).then(data => {
        res.send(data.data);
        res.end();
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end()
    });
});

app.get("/api/data", (req,res) => {
    res.status(401).json({
        "error": "No id provided",
        "description": "Correct syntax is /api/data/:id",
        "success": false
    })
    res.end();
    return false;
});

app.get("/api/data/:id", (req,res) => {
    Axios.get(`https://nhentai.net/api/gallery/${req.params.id}`).then(data => {
        res.send(data.data);
        res.end();
        return true
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end();
    });
});

app.get("/api/tag", (req,res) => {
    res.status(401).json({
        "error": "No id provided",
        "description": "Correct syntax is /api/tag/:id or /api/tag/:id/:page",
        "success": false
    })
    res.end();
    return false;
});

app.get("/api/tag/:tag", (req,res) => {
    Axios.get(`https://nhentai.net/api/galleries/search?query=${req.params.tag}&page=1`).then(data => {
        if(data.data.result[0] === undefined){
            res.status(401).json({
                "error": "Invaild tag",
                "description": "This tag name is invaild",
                "success": false
            });
            res.end();
            return true;
        }
        res.send(data.data);
        res.end();
        return true;
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end()
    });
});

app.get("/api/tag/:tag/:page", (req,res) => {
    let page = req.params.page || 1;
    Axios.get(`https://nhentai.net/api/galleries/search?query=${req.params.tag}&page=${page}`).then(data => {
        if(data.data.result[0] === undefined){
            res.status(401).json({
                "error": "Invaild tag",
                "description": "This tag name is invaild",
                "success": false
            });
            res.end();
            return true;
        }
        if(data.data.error === true){
            res.status(401).json({
                "error": "Invaild page",
                "description": "This page exceed pages limit, try lower page down",
                "success": false
            });
            res.end();
            return true;
        }
        res.send(data.data);
        res.end();
        return true;
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end()
    });
});

app.get("/api/image/:id/" , (req,res) => {
	const extend = (obj, src) => {
        for (let key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    Axios.get(`https://nhentai.net/api/gallery/${req.params.id}`).then(async data => {
        let pages = data.data.images.pages,
            media = data.data.media_id;

        await pages.forEach((page, index) => {
            let imageType;
            switch(page.t){
                case "j":
                    imageType = "jpg";
                    break;
                case "p":
                    imageType = "png";
                    break;
                case "g":
                    imageType = "gif";
                    break;
                default:
                    imageType = "jpg"
                    break;
            }
            extend(page, { src: `https://i.nhentai.net/galleries/${media}/${index + 1}.${imageType}` });
        });

        let imageCoverData = data.data.images.cover,
            coverType;
        switch(imageCoverData){
            case "j":
                coverType = "jpg";
                break;
            case "p":
                coverType = "png";
                break;
            case "g":
                coverType = "gif";
                break;
            default:
                coverType = "jpg"
                break;
        }

        let coverImage = extend(imageCoverData, { src: `https://i.nhentai.net/galleries/${media}/cover.${coverType}` })

        let images = {
            cover: coverImage,
            pages: Object.assign({}, pages),
            success: true
        };

        res.send(images);
        res.end();
        return true;
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end()
    });
});

app.get("/api/image/:id/:pages" , (req,res) => {
	const extend = (obj, src) => {
        for (let key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    Axios.get(`https://nhentai.net/api/gallery/${req.params.id}`).then(async data => {
        let page = data.data.images.pages[+req.params.pages + 1],
            media = data.data.media_id;

        if(page === undefined){
            res.json({
                images: {},
                description: "Page doesn't exists",
                success:false
            });
            return;
        }

        let imageType;
        switch(page){
            case "j":
                imageType = "jpg";
                break;
            case "p":
                imageType = "png";
                break;
            case "g":
                imageType = "gif";
                break;
            default:
                imageType = "jpg"
                break;
        }
        extend(page, { src: `https://i.nhentai.net/galleries/${media}/${req.params.pages}.${imageType}` });

        let images = {
            pages: Object.assign({}, page),
            success: true
        };

        res.send(images);
        res.end();
        return true;
    }).catch(err => {
        res.status(401).json({
            "success": false,
            "description": "Page doesn't exists",
            "error": "Failed to fetch"
        });
        res.end()
    });
});

app.get("/version", (req,res) => {
    res.send(process.version);
    res.end();
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