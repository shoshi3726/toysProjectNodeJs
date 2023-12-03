const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel")
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Users of books work" })
})

router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.put("/:idEdit", auth, async (req, res) => {
  let idEdit = req.params.idEdit;
  let validBody = userValid(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try{

    let data;
    if (req.tokenData._role == "admin") {
      req.body.password = await bcrypt.hash(req.body.password, 10)

      data = await UserModel.updateOne({ _id: idEdit }, req.body);
    }
    else if (idEdit == req.tokenData.user_id) {
      req.body.password = await bcrypt.hash(req.body.password, 10)

      data = await UserModel.updateOne({ _id: idEdit }, req.body);
    }
    else {
      data = [{ status: "failed", msg: "You are trying to do an operation that is not enabled!" }]
    }
    res.json(data);

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.delete("/:delId", auth, async (req, res) => {
  try {
    let delId = req.params.delId;
    let data;
    if (req.tokenData.role == "admin") {
      data = await UserModel.deleteOne({ _id: delId })
    }
    else {
      data = await UserModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
    }
    if (data.deletedCount == 0)
      res.json({ msg: "not valid id or you are not allowed to erase. nothing was erased" })
    else res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "wasnt able to delete", err })
  }
})



router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})



router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  // במידה ויש טעות בריק באדי שהגיע מצד לקוח
  // יווצר מאפיין בשם אירור ונחזיר את הפירוט של הטעות
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // Get the length of the password
    let passwordLength = user.password.length;
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();

    // Replace the actual password with asterisks
    user.password = '*'.repeat(passwordLength);
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })

    }
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})


router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {

    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }

    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }

    let token = createToken(user._id, user.role);
    res.json({ token });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;