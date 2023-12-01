// 5
const express= require("express");
const { auth } = require("../middlewares/auth");
const {BooksModel,validateBook} = require("../models/bookModel")
const router = express.Router();

router.get("/" , async(req,res)=> {
  let perPage = req.query.perPage || 10;
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

router.get("/single/:idBook" , async(req,res)=> {
  try{
    let idBook = req.params.idBook
    let data = await BooksModel.findOne({_id:idBook})
    res.json(data);
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.get("/search",async(req,res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try{
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS,"i")
    let data = await BooksModel.find({
      $or: [
        { name: searchReg },
        { info: searchReg }
      ]
    })
    .limit(perPage)
    .skip((page - 1) * perPage)
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})


router.get("/category/:catName",async(req,res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try{
    let cat = req.params.catName;

    let data = await BooksModel.find({category:cat})
    .limit(perPage)
    .skip((page - 1) * perPage)
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

router.get("/prices", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;

  let minPrice = parseFloat(req.query.min) || 0;
  let maxPrice = parseFloat(req.query.max) || Infinity;

  try {
    let data = await BooksModel.find({
      price: { $gte: minPrice, $lte: maxPrice }
    })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ price: 1 }); 

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "There was an error. Please try again later.", err });
  }
});



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

    if (data.deletedCount === 0) {
      return res.status(403).json({ msg: "Unauthorized to delete this book" });
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

module.exports = router;