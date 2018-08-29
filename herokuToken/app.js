const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/getCode", (req, res) => {
  var code = req.body.code;

  var userCode = { code: code };

  axios({
    method: "post",
    url: "https://www.teamwork.com/launchpad/v1/token.json",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    data: userCode
  }).then(response => {
    if (response.data && response.data.access_token) {
      res.status(200).json({ access_token: response.data.access_token });
    }
  });
});

// Server
app.listen(PORT, () => console.log("I am listening on ${PORT}!"));
