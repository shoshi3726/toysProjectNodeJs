// 2
const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
  // mongoose.set('strictQuery' , false);
  mongoose.set('strictQuery' , false);
  await mongoose.connect(
    `mongodb+srv://${config.userDb}:${config.passDb}@cluster0.uvvgws0.mongodb.net/nodeProject`
    );
  console.log("mongo connect started");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}