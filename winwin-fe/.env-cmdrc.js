const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  common: {
    REACT_APP_PLATFORM_PUB: process.env.PLATFORM_PUB,
    REACT_APP_PLATFORM_ID: process.env.PLATFORM_ID
  },
  local: {
  },
  dev: {},
  prod: {}
};
