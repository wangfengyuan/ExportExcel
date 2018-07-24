let express = require("express");
let multer = require("multer");
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var formidable = require('formidable');
var util = require("util");
var fs = require("fs");
let app = express();

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

app.get("/", function(req, res) {
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
            let itemUrl = [1, imgName, "static/" + imgName];
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

let xlsx = require('xlsx');

function to_json(workbook) {
	var result = {};
	var sheetNames = workbook.SheetNames; 
	workbook.SheetNames.forEach(function(sheetName) {
        var worksheet = workbook.Sheets[sheetName];
		result[sheetName] = xlsx.utils.sheet_to_json(worksheet);
	});	
	// console.log("打印表信息",JSON.stringify(result, 2, 2)); 
	return result;
}

var workbook = xlsx.readFile("test.xlsx");

app.get("/download", function(req, res) {
    console.log(downloadURL);
    var data = [[1,2,3],[4,5,6]];
    const ws = xlsx.utils.aoa_to_sheet(data);
    var wscols = [
        {wch:6},
        {wch:20},
        {wch:50}
    ];
    ws['!cols'] = wscols;
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "SheetJS");
    var wopts = { bookType: "csv", bookSST:false, type:'buffer' };
    /* generate buffer */
    //var buf = xlsx.write(wb, wopts);
    xlsx.writeFile(wb, 'a.xlsx');
	res.sendFile(__dirname + "/a.xlsx");
});



app.listen(3000);