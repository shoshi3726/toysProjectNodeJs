const indexR = require("./index");
const usersR = require("./users");
const booksR = require("./books");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/books",booksR)
}