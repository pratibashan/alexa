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

var handlers = {
  LaunchRequest: function() {
    this.response
      .speak("Welcome to Digital Crafts. What can I help you with?")
      .listen("What can I help you with?");
    this.emit(":responseReady");
  },

  UserProjectListsIntent: function() {
    var token = this.event.context.System.user.accessToken;

    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/projects.json?status=ACTIVE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token
      }
    }).then(response => {
      if (response.data.projects.length === 0) {
        this.response.speak("The are no projects assigned to you.");
        this.emit(":responseReady");
      } else {
        var totalProjects = [];

        for (let i = 0; i < response.data.projects.length; i++) {
          var projectName = response.data.projects[i].name;

          totalProjects.push(projectName);
        }

        var responseString =
          "The following projects were assigned to you: " +
          totalProjects.join(", ");

        this.response.speak(responseString);
        this.emit(":responseReady");
      }
    });
  },

  CompletedTasksIntent: function() {
    var token = this.event.context.System.user.accessToken;

    axios({
      method: "get",
      url:
        "https://alexalapraim.teamwork.com/completedtasks.json?startdate=" +
        yesterday +
        "&enddate=" +
        today,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    }).then(response => {
      if (response.data.tasks.length === 0) {
        this.response.speak(
          "There were no tasks completed in the past twenty four hours."
        );
        this.emit(":responseReady");
      } else {
        var array = [];
        var i = 0;
        let numberCompleted = response.data.tasks.length;
        for (i; i < response.data.tasks.length; i++) {
          let numberTask = i + 1;
          let completer = response.data.tasks[i].completerFirstName;
          let taskContent = response.data.tasks[i].content;
          let completedOn = response.data.tasks[i].completedOn;
          let projectName = response.data.tasks[i].projectName;

          let stringAlexa =
            "Task " +
            numberTask +
            ", " +
            taskContent +
            " for Project " +
            projectName +
            ", was completed by " +
            completer +
            ".";

          array.push(stringAlexa);
        }

        if (numberCompleted == 1) {
          var responseString =
            "Only " +
            numberCompleted +
            " task was completed in the past 24 hours. " +
            array.join(" ");

          this.response.speak(responseString);
          this.emit(":responseReady");
        } else {
          var responseString =
            "A total of " +
            numberCompleted +
            " tasks were completed in the past 24 hours. " +
            array.join(" ");

          this.response.speak(responseString);
          this.emit(":responseReady");
        }
      }
    });
  },

  OverdueProjectIntent: function() {
    var token = this.event.context.System.user.accessToken;

    //fetch API//
    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/tasks.json?filter=overdue",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    }).then(response => {
      // if no items are overdue, Alexa will respond //
      if (response.data["todo-items"].length === 0) {
        this.response.speak("There are currently no tasks overdue.");
        this.emit(":responseReady");
      } else {
        // if there is/are item(s) in the list, Alexa will run a for loop //
        var array = [];
        var i = 0;
        let numberOverdue = response.data["todo-items"].length;
        for (i; i < response.data["todo-items"].length; i++) {
          let numberTask = i + 1;
          let dateAgo =
            parseInt(today) -
            parseInt(response.data["todo-items"][i]["due-date"]);
          let taskContent = response.data["todo-items"][i].content;
          let projectName = response.data["todo-items"][i]["project-name"];

          let stringAlexa =
            "Task " +
            numberTask +
            ", " +
            taskContent +
            " for Project " +
            projectName +
            ", was due " +
            dateAgo +
            " days ago.";

          array.push(stringAlexa);
        }
        // if only 1 item in the array, Alexa will respond //
        if (numberOverdue == 1) {
          var responseString =
            "Only " + numberOverdue + " task is overdue. " + array.join(" ");

          this.response.speak(responseString);
          this.emit(":responseReady");
        } else {
          // Response when multiple items in the array //
          var responseString =
            "A total of " +
            numberOverdue +
            " tasks are overdue. " +
            array.join(" ");

          // respond from Lambda to Alexa //
          this.response.speak(responseString);
          this.emit(":responseReady");
        }
      }
    });
  },
  EachProjectTasksIntent: function() {
    var token = this.event.context.System.user.accessToken;

    var projectName = this.event.request.intent.slots.projectname.value;
    //.replace() method to remove all the special characters
    var projectName_USER = projectName

      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
      .toLowerCase();

    var projectId = "";

    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/projects.json?status=ACTIVE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    })
      .then(response => {
        // console.log(response.data.projects[0].name)
        if (response.data.projects.length === 0) {
          this.response.speak("There are no projects with that name.");
          this.emit(":responseReady");
        } else {
          for (let i = 0; i < response.data.projects.length; i++) {
            var projectName_TW = response.data.projects[i].name;
            var projectName_TWLC = projectName_TW
              //.replace() method to remove all the special characters
              .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
              .toLowerCase();
            //console.log(newProjectName);
            if (projectName_TWLC === projectName_USER) {
              projectId = response.data.projects[i].id;
              break;
            }
          }
          return projectId;
        }
      })
      .then(projectId => {
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
        }).then(response => {
          if (response.data["todo-items"].length === 0) {
            this.response.speak(
              "There were no tasks assigned for the " + projectName + "project."
            );
            this.emit(":responseReady");
          } else {
            var totalTasksArray = [];

            let totalTasks = response.data["todo-items"].length;
            for (let i = 0; i < response.data["todo-items"].length; i++) {
              let taskNumber = i + 1;
              let taskContent = response.data["todo-items"][i].content;
              let responsiblePerson =
                response.data["todo-items"][i]["responsible-party-firstname"];

              let startDate_string =
                response.data["todo-items"][i]["start-date"];
              let dueDate_string = response.data["todo-items"][i]["due-date"];
              //.replace() method to to convert date string into date format
              let startDate_dformat = startDate_string.replace(
                /(\d\d\d\d)(\d\d)(\d\d)/,
                "$1/$2/$3"
              );
              let dueDate_dformat = dueDate_string.replace(
                /(\d\d\d\d)(\d\d)(\d\d)/,
                "$1/$2/$3"
              );
              let stringAlexa =
                "Task " +
                taskNumber +
                ", " +
                taskContent +
                " is assigned to " +
                responsiblePerson +
                ", on " +
                startDate_dformat +
                " and due on " +
                dueDate_dformat +
                ".";

              totalTasksArray.push(stringAlexa);
            }

            if (totalTasks == 1) {
              var responseString =
                "Only " +
                totalTasks +
                " task is assigned for the " +
                projectName +
                "project." +
                array.join(" ");

              this.response.speak(responseString);
              this.emit(":responseReady");
            } else {
              var responseString =
                "A total of " +
                totalTasks +
                " tasks are assigned for " +
                projectName +
                " project. " +
                totalTasksArray.join(" ");

              this.response.speak(responseString);
              this.emit(":responseReady");
            }
          }
        });
      });
  },

  CreateProjectIntent: function() {
    var token = this.event.context.System.user.accessToken;

    let projectName = this.event.request.intent.slots.projectname.value;
    let projectDescription = this.event.request.intent.slots.projectdescription
      .value;
    let startDate_String = this.event.request.intent.slots.startdate.value;
    let endDate_String = this.event.request.intent.slots.enddate.value;
    let startDate = new Date(startDate_String)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    let endDate = new Date(endDate_String)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    let newProject = {
      project: {
        name: projectName,
        description: projectDescription,
        startDate: startDate,
        endDate: endDate
      }
    };

    axios({
      method: "post",
      url: "https://alexalapraim.teamwork.com/projects.json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      },
      data: newProject
    }).then(response => {
      if ((response.data.STATUS = "OK")) {
        this.response.speak(newProject.project.name + " is created");
        this.emit(":responseReady");
      } else {
        this.response.speak("An error occured while creating a project");
        this.emit(":responseReady");
      }
    });
  },

  CreateProjectWithNameIntent: function() {
    var token = this.event.context.System.user.accessToken;

    let projectName = this.event.request.intent.slots.projectname.value;

    let newProject = {
      project: {
        name: projectName
      }
    };

    axios({
      method: "post",
      url: "https://alexalapraim.teamwork.com/projects.json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      },
      data: newProject
    }).then(response => {
      if ((response.data.STATUS = "OK")) {
        this.response.speak(newProject.project.name + " project is created");
        this.emit(":responseReady");
      } else {
        this.response.speak("An error occured while creating a project");
        this.emit(":responseReady");
      }
    });
  },

  DeleteProjectIntent: function() {
    var projectName = this.event.request.intent.slots.projectname.value;
    //.replace() method to remove all the special characters
    var projectName_USER = projectName

      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
      .toLowerCase();

    var projectId = "";

    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/projects.json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    })
      .then(response => {
        if (response.data.projects.length === 0) {
          this.response.speak("There are no projets with that name.");
          this.emit(":responseReady");
        } else {
          for (let i = 0; i < response.data.projects.length; i++) {
            var projectName_TW = response.data.projects[i].name;
            var projectName_TWLC = projectName_TW
              //.replace() method to remove all the special characters
              .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
              .toLowerCase();
            //console.log(newProjectName);
            if (projectName_TWLC === projectName_USER) {
              projectId = response.data.projects[i].id;
              break;
            }
          }
          return projectId;
        }
      })
      .then(projectId => {
        axios({
          method: "delete",
          url:
            "https://alexalapraim.teamwork.com/projects/" + projectId + ".json",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: auth
          }
        }).then(response => {
          if (response.data.STATUS == "OK") {
            this.response.speak(projectName + " is deleted");
            this.emit(":responseReady");
          } else {
            this.response.speak(
              "An error occured while deleting the " +
                projectName +
                "Do you want to try again?"
            );
            this.emit(":responseReady");
          }
        });
      });
  },

  GetTaskListNameIntent: function() {
    var projectName = this.event.request.intent.slots.projectname.value;
    var tasklistName = this.event.request.intent.slots.tasklistname.value;
    var projectName_USER = projectName

      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
      .toLowerCase();
    var tasklistName_USER = tasklistName
      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
      .toLowerCase();
    var tasklistId = "";

    axios({
      method: "get",
      url: "https://alexalapraim.teamwork.com/tasklists.json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth
      }
    }).then(response => {
      // console.log(response.data.projects[0].name)
      if (response.data.tasklists.length === 0) {
        this.response.speak("There are no projects with that name.");
        this.emit(":responseReady");
      } else {
        for (let i = 0; i < response.data.tasklists.length; i++) {
          var projectName_TW = response.data.tasklists[i].projectName;
          var projectName_TWLC = projectName_TW
            //.replace() method to remove all the special characters
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase();
          var tasklistName_TW = response.data.tasklists[i].name;
          var tasklistName_TWLC = tasklistName_TW
            //.replace() method to remove all the special characters
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase();
          //console.log(newProjectName);
          if (
            projectName_TWLC === projectName_USER &&
            tasklistName_TWLC === tasklistName_USER
          ) {
            tasklistId = response.data.tasklists[i].id;
            break;
          }
        }
        this.attributes.tasklist_Id = tasklistId;

        this.response
          .speak(
            "Please provide task name, responsible person name,start date,end date to create a task" +
              this.attributes.tasklist_Id
          )
          .listen("Provide task details to create a task ");
        this.emit(":responseReady");
      }
    });
  },

  CreateTaskIntent: function() {
    var taskName = this.event.request.intent.slots.taskname.value;

    // var reponsiblePerson = this.event.request.intent.slots.responsibleperson
    //   .value;
    // let startDate_String = this.event.request.intent.slots.startdate.value;
    // let endDate_String = this.event.request.intent.slots.enddate.value;
    // let startDate = new Date(startDate_String)
    //   .toISOString()
    //   .slice(0, 10)
    //   .replace(/-/g, "");
    // let endDate = new Date(endDate_String)
    //   .toISOString()
    //   .slice(0, 10)
    //   .replace(/-/g, "");

    // let newTask = {
    //   "todo-items": {
    //     content: taskName,
    //     "responsible-party-firstname": responsiblePerson,
    //     "start-date": startDate,
    //     "end-date": endDate
    //   }
    // };

    this.response.speak(taskName);
    this.emit(":responseReady");
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
  alexa.appId = "amzn1.ask.skill.74d19ecb-691b-40a7-94d1-eb90c012f9c9";
  alexa.execute();
};
