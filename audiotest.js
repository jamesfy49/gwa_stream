var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var axios = require('axios');
var soundgasmApi = require('soundgasm-api');

var server = http.createServer(function(req, res){
    const request_path = req.url.split("?")[0];
    console.log(request_path);
    switch(request_path) {
        case "/":
            respond(req, res);
            break;
        case "/audio":
        case "/audio/":
            respondAudio(req, res);
            break;
        default:
            res.end();
    }
});

function respondAudio(req, res) {

    
    axios.get("https://media.soundgasm.net/sounds/50e1c694f066d5f8e0a70faee7edb171b65b8417.m4a", {responseType: 'stream'})
        .then((response) => {
            
            const length = response.headers['content-length'];
            lengthminusone = (parseInt(length) - 1).toString();

            const head = {
                'Accept-Ranges': 'bytes',
                'Content-Length': length,
                'Content-Range': `bytes 0-${lengthminusone}/${length}`,
                'Content-Type': 'audio/mp4',
            };
            res.writeHead(206, head);
            response.data.pipe(res);
        })
        .catch(error => {
            console.log(error);
            res.writeHead(404);
            res.end();
        });
}

function respond(req, res){
	var p = __dirname + req.url;
	var ext = path.extname(p);
	fs.exists(p, function(exists){
        if(exists){
            if(ext == ''){
                let file = fs.readFileSync("audiotest.html");
                res.writeHead(200, {"Content-Type":"text/html"});
                res.end(file);
			}else if(valid_types.indexOf(ext) != -1){
				let contentType;
				if(ext == '.webm'){
					contentType = "video/webm";
				}else{
					contentType = "image/" + ext.substring(1,4);
				}
				fs.readFile(p, function(err, data){
					res.writeHead(200, {"Content-type":contentType});
					res.end(data, 'binary');
				});
			}else{
				if(ext == '.css'){
					res.writeHead(200, {"Content-Type":"text/css"});
					fs.readFile(p, function(err, data){
						if(err) throw err;
						res.end(data);
					});
				}
			}
		}else{
			res.end();
		}
	});
}

/*
axios.get("https://soundgasm.net/u/playswellwithothers/First-DP-with-the-fuck-machine")
    .then((response) => {
        console.log(response.data);
    })
    .catch(error => {
        console.log(error);
        res.writeHead(404);
        res.end();
    });
*/

server.listen(3434, "0.0.0.0");
console.log("Listening on 3434...");