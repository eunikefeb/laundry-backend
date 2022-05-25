//import express
const express = require("express")
const app = express()
app.use(express.json())

//import model
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi
const paket = models.paket
const outlet = models.outlet
const member = models.member
const user = models.user

//Endpoint untuk menampilkan semua data transaksi
app.get("/", async (req, res) =>{
    let result = await transaksi.findAll({
        include: [
            "member","outlet","user",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["paket"]
            }
        ]
    })
    res.json({
        transaksi: result,
        count : result.length
    })
})


//endpoint untuk menampilkan data transaksi berdasarkan id
app.get("/byTransaksi/:id_transaksi", async (req, res) =>{
    let param = { id_transaksi: req.params.id_transaksi}
    let result = await transaksi.findOne({
        where: param,
        include: [
            "member","outlet","user",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["paket"]
            }
        ]
    })
    res.json(result)
})

//endpoint untuk menampilkan data transaksi berdasarkan id outlet
app.get("/byOutlet/:id_outlet", async (req, res) =>{
    let param = { id_outlet: req.params.id_outlet}
    let result = await transaksi.findAll({
        where: param,
        order: [
            ["id_transaksi", "DESC"],
            ["tgl", "DESC"],
          ],
        include: [
            "member","outlet","user",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["paket"]
            }
        ]
    })
    res.json(result)
})


// //endpoint untuk menambahkan data transaksi baru
app.post("/", async (req, res) =>{
    // let current = new Date().toISOString().split('T')[0]
    let current = new Date().toISOString().split('T')[0]
    let code = `CVR${Math.random}`
    let now = new Date()
    let tgl = Date.now()
    let invoices = "Cuci"
    now.setDate(now.getDate() + 3)
    let data = {
        id_outlet: req.body.id_outlet,
        kode_invoice:  invoices + tgl,
        id_member: req.body.id_member,
        tgl: current,
        batas_waktu: now,
        tgl_bayar: req.body.tgl_bayar,
        biaya_tambahan: req.body.biaya_tambahan,
        diskon: req.body.diskon,
        pajak: req.body.pajak,
        status: req.body.status,
        dibayar: req.body.dibayar,
        id_user: req.body.id_user,
        total: req.body.total
    }
    transaksi.create(data)
        .then(result => {
            // res.json({
            //     message: "data has been inserted"
            // })
            let lastID = result.id_transaksi
            detail = req.body.detail_transaksi
            detail.forEach(element => {
                element.id_transaksi = lastID
            });
            detail_transaksi
            .bulkCreate(detail, { individualHooks: true})       
            .then(result => {
                res.json({
                    message: "Data has been inserted"
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// endpoint update data transaksi
app.put("/:id", async (req, res) => {
  let param = {
    id_transaksi: req.params.id
  }
  let current = new Date().toISOString().split("T")[0];
  let data = {
    status: req.body.status,
    dibayar: req.body.dibayar
  };
  if (data.dibayar === "dibayar") {
    data.tgl_bayar = current
  }
  transaksi
    .update(data, { where: param })
    .then(async (result) => {
      res.json({
        message: "Berhasil update"
      })
    })
    .catch((error) => {
      return res.json({
        message: error.message,
      });
    });
});


// endpoint untuk menghapus data transaksi
app.delete("/:id_transaksi", async (req, res) =>{
    let param = { id_transaksi: req.params.id_transaksi}
    try {
        await detail_transaksi.destroy({where: param})
        await transaksi.destroy({where: param})
        res.json({
            message : "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = app