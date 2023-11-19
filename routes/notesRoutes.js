const express = require("express");
const auth = require("../models/authModel");
const notes = require("../models/notesModel");
const router = express.Router();

router.get("/get", (req,res)=>{
    try{
        notes.find((err,data)=>{
            if(err){
                return res.status(400).send({ msg: "Error while retrieving data" });
            }
            res.status(200).send(data);
        });
    }catch(error){
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

router.get("/searchNotes/:key", async(req,res)=>{
    let result = await notes.find({
        "$or": [
            {
                title: { $regex: req.params.key }
            },
            {
                description: { $regex: req.params.key }
            }
        ]
    });
    res.send(result);
});

router.get('/getOne/:dataID', (req, res) => {
    try{
        notes.findOne({_id: req.params.dataID}, (err, data) => {
            if(err){
                return res.status(400).send({message: 'Error while retrieving an data. Please check the data'})
            }

            res.status(200).send(data);
        })
    }catch(error){
        res.status(500).send({
            message: 'Internal Server Error'
        })
    }
});

router.post("/create", auth.authenticateUser, async (req, res) => {
    try {
        const payload = req.body;
        const newData = new notes(payload);
        await newData.save((err,data) => {
            if(err){
                return res.status(400).send({ msg: "Error while adding data" });
            }
            res.status(201).send({ dataId: data._id, msg: "Data has been added successfully" });
        });
    } catch (err) {
        res.status(500).send({ msg: "Internal Server Error" });
        console.log(err);
    }
  });

router.put("/update/:dataID", auth.authenticateUser, (req,res)=>{
    try{
        notes.findByIdAndUpdate({ _id: req.params.dataID }, { $set: req.body }, (err,data)=>{
            if(err){
                return res.status(400).send({ msg: "Error while updating data" });
            }
            res.status(201).send({ dataId: data._id, msg: "Data have been updated" });
        });
    }catch(error){
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

router.delete("/delete/:dataID",auth.authenticateUser ,(req,res)=>{
    try{
        notes.deleteOne({ _id: req.params.dataID }, (err,data)=>{
            if(err){
                return res.status(400).send("Error while deleting data");
            }
            res.status(200).send({ msg: `Data with id ${req.params.dataID} has been deleted` });
        });
    }catch(error){
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

module.exports = router;