const express= require("express");
const router = express.Router();

router.get("/" , (req,res)=> {
  res.json({msg:"books nodejs project works!!"})
})

module.exports = router;