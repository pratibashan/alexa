"use strict";

var axios = require("axios");
var Alexa = require("alexa-sdk");
var key = "twp_8ERiNvMekc5pqzoJ5V6b80IunZjx";
var password = "alexa2018";
var auth = "Basic " + new Buffer.from(key + ":" + password).toString("base64");

var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var dt = date.getDate();
var ydt = date.getDate() - 1;

if (dt < 10) {
  dt = "0" + dt;
}
if (month < 10) {
  month = "0" + month;
}

var today = year.toString() + month.toString() + dt.toString();
var yesterday = year.toString() + month.toString() + ydt.toString();

var projectName = "Houston Digital Marketing";

var handlers = {
  LaunchRequest: function() {
    this.response
      .speak("Welcome to Lapraim Digital. What can I help you with?")
      .listen("What can I help you with?");
    this.emit(":responseReady");
  },

  EachProjectTasksIntent: function() {
    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/tasks.json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    }).then(function(response) {
      if (response.data.tasks["todo-items"].length === 0) {
        this.response.speak("There were no tasks assigned for the projects.");
        this.emit(":responseReady");
      } else {
        for (let i = 0; i < response.data["todo-items"].length; i++) {
          if (response.data["todo-items"][i]["project-name"] === projectName) {
            var projectId = response.data["todo-items"][i]["project-id"];
            console.log("1:" + projectId);

            axios({
              method: "get",
              url:
                "https://alexalapraim.teamwork.com/projects/" +
                projectId +
                "/tasks.json",

              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: auth
              }
            }).then(function(response) {
              //console.log(response.data);
              console.log(response.data["todo-items"].length);
              if (response.data["todo-items"].length === 0) {
                this.response.speak(
                  "There were no tasks assigned for the " +
                    projectName +
                    "project."
                );
                this.emit(":responseReady");
              } else {
                var array = [];

                let totalTasks = response.data["todo-items"].length;
                for (let i = 0; i < response.data.tasks.length; i++) {
                  let taskNumber = i + 1;
                  let taskContent = response.data["todo-items"][i].content;
                  let responsiblePerson =
                    response.data["todo-items"][i][
                      "responsible-party-firstname"
                    ];

                  let startDate = response.data["todo-items"][i]["start-date"];
                  let dueDate = response.data["todo-items"][i]["due-date"];

                  let stringAlexa =
                    "Task " +
                    taskNumber +
                    ", " +
                    taskContent +
                    " is assigned to " +
                    responsiblePerson +
                    ", on " +
                    startDate +
                    " and due on " +
                    dueDate +
                    ".";

                  array.push(stringAlexa);
                }

                if (totalTasks == 1) {
                  var responseString =
                    "Only " +
                    totalTasks +
                    " task is assigned for the " +
                    projectName +
                    "project.";
                  array.join(" ");

                  this.response.speak(responseString);
                  this.emit(":responseReady");
                } else {
                  var responseString =
                    "A total of " +
                    totalTasks +
                    " tasks are assigned for the " +
                    projectName +
                    "project." +
                    array.join(" ");

                  this.response.speak(responseString);
                  this.emit(":responseReady");
                }
              }
            });
          }
        }
      }
    });
  },

  "AMAZON.StopIntent": function() {
    this.response.speak("Ok, thanks for visiting!");
    this.emit(":responseReady");
  },

  "AMAZON.CancelIntent": function() {
    this.response.speak("Ok, thanks for visiting!");
    this.emit(":responseReady");
  },

  "AMAZON.HelpIntent": function() {
    const speechOutput =
      "You can say tell me what projects were completed in the past 24 hours, or, you can say stop... What can I help you with?";
    const reprompt = "What can I help you with?";

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(":responseReady");
  },

  "AMAZON.FallbackIntent": function() {
    const speechOutput =
      "Not sure I understand. You can say: what tasks were completed in the past twenty four hours?";
    const reprompt = "What can I help you with?";

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(":responseReady");
  },

  Unhandled: function() {
    this.emit(":tell", "Thanks for talking to me!");
  }
};

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.appId = "amzn1.ask.skill.91a16b52-e71d-4696-b734-22e6a313a9cc";

  alexa.execute();
};
