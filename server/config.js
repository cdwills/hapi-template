function strict(){
  "use strict";
}

require('dotenv').load();


module.exports = {
  server: {
    port: process.env.PORT || 8008
  },
};
