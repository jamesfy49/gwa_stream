const createServer = require('http').createServer;
const axios = require('axios');
const formidable = require('formidable');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');

const _PORT = 5000;

const user_info = require("./userinfo.json");
const api = require("./api.json");
const { resolve } = require('path');

const client_id = api.client_id;
const client_secret = api.client_secret;

const token_url = "https://www.reddit.com/api/v1/access_token/";

let expiration;
let token;

const refreshToken = () => {
    return new Promise((resolve, reject) => {
        console.log("refreshing");
        const req_body = {
            'grant_type': "password",
            'username': user_info.username,
            'password': user_info.password
        };
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'GWAStream by primetime'
            },
            auth: {
                'username': client_id,
                'password': client_secret
            }
        }
        axios.post(token_url, qs.stringify(req_body), config)
            .then((result) => {
                token = result.data.access_token;
                expiration = Date.now() + (result.data.expires_in * 1000);
                resolve();
            })
            .catch((err) => {
                console.error("Error fetching token.");
                reject();
            });
    });
}

const handler = (req, res) => {
    const request_path = req.url.split("?")[0];
    switch(request_path) {
        case "/api/gwa/browse/":
        case "/api/gwa/browse":
            if(Date.now() >= expiration || expiration === undefined) {
                refreshToken()
                    .then(() => returnAudios(req, res))
                    .catch(() => {
                        res.end();
                    });
            } else {
                returnAudios(req, res);
            }
            break;
        case "/api/gwa/getSource/":
        case "/api/gwa/getSource":
            returnSource(req, res);
            break;
        case "/api/gwa/audio/":
        case "/api/gwa/audio":
            returnAudio(req, res);
            break;
        default:
            res.end();
    }
};

const returnSource = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        const req_url = fields.url;
        axios.get(req_url)
        .then(response => {
            const src_regex = new RegExp(/([A-Za-z0-9\_\-]+)?\.m4a/g);
            const src = response.data.match(src_regex)[0];
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({src}));
        })
        .catch(err => {
            console.log(`error: ${err}`);
        });
    })
}

const returnAudio = (req, res) => {

    const query = url.parse(req.url, true).query;
    const audio_src = `https://media.soundgasm.net/sounds/${query.src}`;

    const config = {
        responseType: 'stream',
        headers: {
            'range': req.headers.range
        }
    }

    axios.get(audio_src, config)
        .then((response) => {

            const byteRange = req.headers.range;
            const length = response.headers['content-length'];

            const numExp = new RegExp(/(\d+)/g);
            const begin = parseInt(byteRange.match(numExp)[0]);
            const end = begin + parseInt(length) - 1; 

            let contentRange = `bytes ${begin}-${end}/${length}`;
            /*
            if(req.headers['user-agent'].indexOf("Chrome") !== -1) {
                contentRange = `bytes 0-${length - 1}/${length}`;
            }
            */
            const head = {
                'Access-Control-Allow-Origin': "*",
                'Connection': 'keep-alive',
                'Accept-Ranges': 'bytes',
                'Content-Length': length,
                'Content-Range': contentRange,
                'Content-Type': 'audio/x-m4a'
            }
            res.writeHead(206, head);
            response.data.pipe(res);
        })
        .catch(error => {
            console.log(error);
            res.writeHead(404);
            res.end();
        });
}

const returnAudios = (req, res) => {

    const form = new formidable.IncomingForm();
    /*
        body: JSON.stringify({
            after: this.state.after,
            categories: this.state.activeCategories,
            search: this.state.search,
            sort: this.state.sort,
            time: this.state.time
        }),
    */
    form.parse(req, (err, fields) => {

        const base = "https://oauth.reddit.com/r/gonewildaudio";
        let dest;

        const times = {
            "Past Hour":"hour",
            "Past 24 Hours":"day",
            "Past Week":"week",
            "Past Month":"month",
            "Past Year":"year",
            "All Time":"all"
        }

        const sorts = {
            "Hot": "hot",
            "New": "new",
            "Top": "top",
            "Relevant": "relevance"
        }

        const query = {};

        if(fields.search === '') {
            switch(fields.sort){
                case "New":
                    dest = "/new/.json";
                    break;
                case "Top":
                    dest = "/top/.json";
                    break;
                default:
                    dest = "/hot/.json";
            }
        } else {
            query.q = fields.search;
            query.restrict_sr = 1;
            if(sorts[fields.sort] != undefined) {
                query.sort = sorts[fields.sort];
            }
            dest = "/search/.json";
        }

        if(fields.categories.length > 0) {
            const catstring = fields.categories.join(" ");
            if(fields.search === '') {
                dest = "/search/.json";
                query.q = catstring;
                query.restrict_sr = 1;
                if(sorts[fields.sort] != undefined) {
                    query.sort = sorts[fields.sort];
                }
            } else {
                query.q += " " + catstring;
            }
        }

        if(times[fields.time] === undefined) {
            query.t = "week";
        } else {
            query.t = times[fields.time];
        }

        if(fields.after != '') {
            query.after = fields.after;
        }
    
        const url = base + dest + "?" + qs.stringify(query);
    
        const config = {
            headers: {
                'Authorization': "bearer " + token,
                'User-Agent': "GWAStream by primetime"
            }
        }
    
        axios.get(url, config)
            .then(response => {
    
                const after = response.data.data.after;
    
                let results = response.data.data.children.map(item => {
                    return {
                        'id': item.data.id,
                        'title': item.data.title,
                        'selftext': item.data.selftext,
                        'author': item.data.author,
                        'url': item.data.url
                    }
                });

                results.forEach(element => {
                    let title = element.title;
                    element.titlePlain = title;
                    let tagregex = new RegExp(/\[(.*?)\]/g);
                    title = title.replace(tagregex, (match, p1) => {
                        let replacement = 
                            "<span class='title-tag'>"
                            + p1
                            + "</span>";
                        return replacement;
                    });
                    element.title = title;

                    let audioregex = new RegExp(/(https?):\/\/soundgasm.net\/u\/([A-Za-z0-9\_\-]+)?\/([A-Za-z0-9\-\_]+)?/g);
                    let audios = element.selftext.match(audioregex);
                    audios = [...new Set(audios)];
                    element.audios = audios != null ? audios : [];
                });

                results = results.filter(element => 
                    element.audios.length != []
                );
    
                res.writeHead(200, {"Content-Type":"application/json"});
                res.end(JSON.stringify({after, results}));
            })
            .catch(error => {
                console.log(error);
                res.writeHead(404);
                res.end();
            });
    })

}

createServer(handler).listen(_PORT);

console.log(`Listening at ${_PORT}...`);