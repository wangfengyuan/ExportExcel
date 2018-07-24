let express = require("express");
let multer = require("multer");
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var formidable = require('formidable');
var util = require("util");
var fs = require("fs");
let app = express();
var url = require("url");

app.use("/static", express.static('uploads'));

var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
  })

var upload = multer({ storage: storage })
// app.get("/", function(req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

// app.get("/init", function(req, res) {
//     res.sendFile(__dirname + "/test.html");
// });

app.get("/", function(req, res) {
    // console.log(url.parse(req.url, true).query);
    // res.send("登陆成功");
    res.sendFile(__dirname + "/demo.html");
});

app.get("/upload", function(req, res) {
    res.send("upload successfully");
});

var downloadURL = [];

app.post("/upload", function(req, res) {

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        let imgPath = files.pic.path 
        let imgName = files.pic.name 
        let data = fs.readFileSync(imgPath) // 同步读取文件

        fs.writeFile("uploads/" + imgName, data, function(err){ // 存储文件
            let itemUrl = {
                "name": imgName,
                "path": "static/" + imgName
            };
            downloadURL.push(itemUrl);
            if(err){ return console.log(err) }
            let result = {
                "url": "static/" + imgName,
                "name": imgName
            };
            res.send(result);
        })
    })

});

let xlsx = require('node-xlsx');

function sendExcel(res, xlsxData, sheetName, xlsxFileName) {
    try {
        const range = {s: {c: 0, r:0 }, e: {c:0, r:3}}; // A1:A4
        const option = {'!merges': [ range ]};
        let buffer = xlsx.build([{name: sheetName, data: xlsxData}, option]);
        let xlsxContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // For Excel2007 and above .xlsx files
        res.setHeader('Content-Type', xlsxContentType);
        res.setHeader('Content-Disposition', `attachment; filename=${xlsxFileName}.xlsx`);
        res.writeHead(200);
        res.end(buffer);
    } catch (err) {
        console.log('mistake to build excel');
    }
}

app.get('/download', function(req, res, next) {
    // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
    // return sendExcel(res, data, 'sheet表名', 'myfile');

    const data= [];
    data[0] = ["序号","图片名称","URL"];
    downloadURL.forEach( (item, index) => {
        data.push([index, item.name, item.path]);
    });
    return sendExcel(res, data, '表1', 'imgURL');
});


app.listen(80);



