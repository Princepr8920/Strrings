let mongoose = require("mongoose");
let localUser = require("../models/localModel");
let googleUser = require('../models/googleModel');
const { collection } = require("../models/localModel");

let arr = [localUser,googleUser]

let match; 

//  arr.forEach(collection=>{
//  collection.find({email:email,username:username},function(err,user){
//    if(err){
//      return err
//    }else{
//      match = user
//      console.log(match)
//    }
//  })
//  })
