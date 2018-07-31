let express = require("express");
var formidable = require('formidable');
var fs = require("fs");
let app = express();
var url = require("url");

app.use("/static", express.static('static'));


app.get("/", function(req, res) {
    res.sendFile(__dirname + "/demo.html");
});

var downloadURL = [];

app.post("/upload", function(req, res) {

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        let imgPath = files.pic.path
        let imgName = files.pic.name
            // 同步读取文件
        let data = fs.readFileSync(imgPath)
            // 存储上传的图片，同时获取静态图片地址并返回客户端
        fs.writeFile("static/" + imgName, data, function(err) {
            if (err) {
                console.log(err)
                return;
            }
            let itemUrl = {
                "path": "static/" + imgName
            };
            // downloadURL.push(itemUrl);
            // let result = {
            // "url": "static/" + imgName
            // };
            // res.send(result);
            let url = "static/" + imgName;
            res.send(url);
        })
    })

});

app.listen(80);