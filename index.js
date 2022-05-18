const dotenv = require("dotenv");
const nconf = require("nconf");

dotenv.config();
process.env.ROOT_PATH = __dirname;

console.log("here", process.env.NODE_ENV === "production")
if (nconf.get("NODE_ENV") === "production" || process.env.NODE_ENV === "production") {
  require("./dist/index");
} else {
  require("./src/index");
}