
//import library
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');

//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const model = require('../models/index');
const paket = model.paket

//config storage image
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"./image/paket")
    },
    filename: (req,file,cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//endpoint menampilkan semua data paket, method: GET, function: findAll()
app.get("/", (req,res) => {
    paket.findAll()
        .then(result => {
            res.json({
                paket : result,
                count : result.length
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//menampilkan data paket berdasarkan id
app.get("/:id_paket", (req, res) =>{
    paket.findOne({ where: {id_paket: req.params.id_paket}})
    .then(result => {
        res.json({
            paket: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//Bersasarkan id_outlet
app.get("/byOutlet/:id_outlet", async (req, res) => {
    let result = await paket.findAll({
        where: { id_outlet: req.params.id_outlet },
        include: [
            "outlet",
            {
                model: model.outlet,
                as: "outlet",
            }
        ]
    })
    res.json({
        paket: result
    })

})

//endpoint untuk menyimpan data paket, METHOD: POST, function: create
app.post("/",  upload.single("image"), (req,res) => {
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
    let data = {
        id_outlet : req.body.id_outlet,
        jenis : req.body.jenis,
        nama_paket : req.body.nama_paket,
        harga : req.body.harga,
        image: req.file.filename
    }

    paket.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
})

//endpoint mengupdate data paket, METHOD: PUT, function:update
app.put("/:id",  upload.single("image"), (req,res) => {
    let param = {
        id_paket : req.params.id
    }
    let data = {
        id_outlet : req.body.id_outlet,
        jenis : req.body.jenis,
        nama_paket : req.body.nama_paket,
        harga : req.body.harga
    }

    if (req.file) {
        // get data by id
        const row = paket.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
           
            // delete old file
            let dir = path.join(__dirname,"../image/paket",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message);
        })

        // set new filename
        data.image = req.file.filename
    }

    paket.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//menghapus data paket berdasarkan id
app.delete("/:id", async (req, res) =>{
    try {
        let param = { id_paket: req.params.id}
        let result = await paket.findOne({where: param})
        let oldFileName = result.image
           
        // delete old file
        let dir = path.join(__dirname,"../image/paket",oldFileName)
        fs.unlink(dir, err => console.log(err))

        // delete data
        paket.destroy({where: param})
        .then(result => {
           
            res.json({
                message: "data has been deleted",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
})

module.exports = app