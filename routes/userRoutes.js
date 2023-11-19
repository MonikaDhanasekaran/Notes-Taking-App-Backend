const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const hashFunction = (password="",rounds=5) => {
    return bcrypt.hashSync(password,rounds);
}

const checkPassword = (password="",hashedpassword="") => {
    return bcrypt.compareSync(password,hashedpassword);
}

router.post("/signup",(req,res,next)=>{
    const { name,email,password,role } = req.body;
    User.find({ email: email }).then((response)=>{
        if(response.length>0){
            return res.status(303).json({
                msg: "Account already exists",
                status: 303,
            });
        }else{
            const user = new User({
                name: name,
                email: email,
                password: hashFunction(password, 10),
                role: role,
            });
            user.save().then((response) => 
            res.status(200).json({
                success: true,
                msg: "User Created Successfully!!",
                status: 201,
            })).catch((e)=>
            res.status(406).json({
                error: e,
                msg: "Creating User Account Failure",
                status: 406
            })
            );
        }
    })
    .catch((e)=>
        res.status(201).json({
            error: e,
            msg: "User doesn't exists",
            status: 201
    })
    );
});  
  
router.post("/login",(req,res,next)=>{
    const { email, password } = req.body;
    User.find({ email: email }).then((response)=>{
        if(response.length<1){
            return res.status(400).json({
                msg: "Account is missing",
                status: 400,
            });
        }else{
            if(!password || !checkPassword(password, response[0].password)){
                return res.status(403).json({
                    msg: "Incorrect Password",
                    status: 403
                });
            }else{
                let tokenData = {
                    email: response[0].email,
                    role: response[0].role,
                };
                let tokenOptions = {
                    expiresIn: "48hr",
                };
                const Token = jwt.sign(tokenData, process.env.SECRET_KEY, tokenOptions);
                return res.status(200).json({
                    success: true,
                    msg: "Authenticated Successfully!!!",
                    Token,
                    status: 200,
                });
            }
        }
    }).catch((e)=>{
        console.log(e);
    })
});

router.get('/getone/:userID', (req, res) => {
    try{
        User.findOne({_id: req.params.userID}, (err, data) => {
            if(err){
                return res.status(400).send({message: 'Error while retrieving an employee. Please check the data'})
            }

            res.status(200).send(data);
        })
    }catch(error){
        res.status(500).send({
            message: 'Internal Server Error'
        })
    }
});

router.post("/forgotpassword", (req,res,next)=>{
    const { email } = req.body;
    User.find({
        email: email,
    }).then((response)=>{
        if(response && response.length > 0){
            const userEmail = { 
                email: response[0].email, 
            };
            return res.status(200).json({
                success: true,
                data: userEmail,
                msg: "Account exists",
            });
        }else{
            return res.status(200).json({
                success: false,
                msg: "Account doesn't exists",
            })
        }
    }).catch((err)=>{
        console.log(err);
    })
});

router.post("/changepassword", (req,res,next)=>{
    const { email="", password="" } = req.body;
    try{
        User.updateOne({ email: email }, { password: hashFunction(password, 10), },
        (err,docs)=>{
            if(err){
                return res.status(400).json({
                    error: err,
                    msg: "Password couldn't be updated",
                });
            }else{
                return res.status(201).json({
                    success: true,
                    data: docs,
                    msg: "Password Updated Successfully!!!",
                })
            }
        }
        )
    }catch(err){

    }
});

module.exports = router;