//"use strict";
//const Alexa = require("alexa-sdk");
const axios = require("axios");

var key = "twp_8ERiNvMekc5pqzoJ5V6b80IunZjx";
var password = "alexa2018";
var auth = "Basic " + new Buffer(key + ":" + password).toString("base64");

axios({
  method: "get",
  url:
    "https://alexalapraim.teamwork.com/completedtasks.json?startdate=20180813&enddate=20180814",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: auth
  }
}).then(function(response) {
  console.log(response.data);
  if (response.data.tasks.length === 0) {
    console.log("No tasks were completed in past 24 hours");
  } else {
    var array = [];
    var totalTasks = response.data.tasks.length;
    var i = 0;
    for (i; i < response.data.tasks.length; i++) {
      let taskNumber = i + 1;
      let completer = response.data.tasks[i].completerFirstName;
      let taskContent = response.data.tasks[i].content;
      let completedOn = response.data.tasks[i].completedOn;
      let projectName = response.data.tasks[i].projectName;

      let stringAlexa =
        " Task " +
        " Description: " +
        taskContent +
        " for " +
        projectName +
        " was completed by " +
        completer;

      array.push(stringAlexa);
    }
    var responseString =
      "There were " +
      totalTasks +
      " tasks completed in 24 hours. " +
      array.join(".");
    //return responseString;
    console.log(responseString);
  }
});
