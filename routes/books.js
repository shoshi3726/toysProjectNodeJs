// 5
const express= require("express");
const { auth } = require("../middlewares/auth");
const {BooksModel,validateBook} = require("../models/bookModel")
const router = express.Router();

router.get("/" , async(req,res)=> {
  let perPage = req.query.perPage || 7;
  let page = req.query.page || 1;

  try{
    let data = await BooksModel.find({})
    .limit(perPage)
    .skip((page - 1) * perPage)
    .sort({_id:-1})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

router.get("/search",async(req,res) => {
  try{
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS,"i")
    let data = await BooksModel.find({name:searchReg})
    .limit(50)
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

router.post("/", auth, async(req,res) => {
  let validBody = validateBook(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let book = new BooksModel(req.body);
    // add the user_id of the user that add the book
    book.user_id = req.tokenData._id;
    await book.save();
    res.status(201).json(book);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

// האדמין יוכל לערוך את כל הרשומות ויוזרים יוכלו לערוך רק את של עצמם
router.put("/:editId",auth, async(req,res) => {
  let validBody = validateBook(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let editId = req.params.editId;
    let data;
    if(req.tokenData.role == "admin"){
      data = await BooksModel.updateOne({_id:editId},req.body)
    }
    else{
       data = await BooksModel.updateOne({_id:editId,user_id:req.tokenData._id},req.body)
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})


// האדמין יוכל למחוק את כל הרשומות ויוזרים יוכלו למחוק רק את של עצמם

router.delete("/:delId",auth, async(req,res) => {
  try{
    let delId = req.params.delId;
    let data;
    // אם אדמין יכול למחוק כל רשומה אם לא בודק שהמשתמש
    // הרשומה היוזר איי די שווה לאיי די של המשתמש
    if(req.tokenData.role == "admin"){
      data = await BooksModel.deleteOne({_id:delId})
    }
    else{
      data = await BooksModel.deleteOne({_id:delId,user_id:req.tokenData._id})
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

module.exports = router;