var axios = require("axios");

var key = "twp_8ERiNvMekc5pqzoJ5V6b80IunZjx";
var password = "alexa2018";
var auth = "Basic " + new Buffer.from(key + ":" + password).toString("base64");

function projectStatus() {
  var projectName = "l.a. publishing company";

  var projectName_USER = projectName
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
    .toLowerCase();
  console.log(projectName_USER);

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
      // console.log(response.data.projects);
      if (response.data.projects.length === 0) {
        this.response.speak("There are no projets with that name.");
        this.emit(":responseReady");
      } else {
        var projectId = "";
        for (let i = 0; i < response.data.projects.length; i++) {
          var projectName_TW = response.data.projects[i].name;
          var projectName_TWLC = projectName_TW
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase();
          console.log(projectName_TWLC);
          if (projectName_TWLC === projectName_USER) {
            projectId = response.data.projects[i].id;
            break;
          }
          console.log(projectId);
        }
        return projectId;
      }
    })
    .then(projectId => {
      console.log(projectId);
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
        console.log(response.data["todo-items"].length);
        if (response.data["todo-items"].length === 0) {
          console.log(
            "There were no tasks assigned for the " + projectName + "project."
          );
        } else {
          var totalTasksArray = [];

          let totalTasks = response.data["todo-items"].length;
          for (let i = 0; i < response.data["todo-items"].length; i++) {
            let taskNumber = i + 1;
            let taskContent = response.data["todo-items"][i].content;
            let responsiblePerson =
              response.data["todo-items"][i]["responsible-party-firstname"];

            let startDate_string = response.data["todo-items"][i]["start-date"];
            let dueDate_string = response.data["todo-items"][i]["due-date"];

            let startDate_dformat = startDate_string.replace(
              /(\d\d\d\d)(\d\d)(\d\d)/,
              "$1/$2/$3"
            );
            let dueDate_dformat = dueDate_string.replace(
              /(\d\d\d\d)(\d\d)(\d\d)/,
              "$1/$2/$3"
            );

            console.log(startDate_dformat);
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

            // this.response.speak(responseString);
            // this.emit(":responseReady");
          } else {
            var responseString =
              "A total of " +
              totalTasks +
              " tasks are assigned for " +
              projectName +
              " project. " +
              totalTasksArray.join(" ");

            console.log(responseString);
          }
        }
      });
    });
}
//projectStatus();

function createProject() {
  let sDate = new Date("2018-08-10")
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  let eDate = new Date("2018-09-10")
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  let newProject = {
    project: {
      name: "Project X",
      description: "My Alexa Project",
      startDate: sDate,
      endDate: eDate
    }
  };
  console.log(newProject);
  axios({
    method: "post",
    url: "https://alexalapraim.teamwork.com/projects.json",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: auth
    },
    data: newProject
  })
    .then(function(response) {
      //console.log("Project Created");
      console.log(response.data);
      if ((response.data.STATUS = "OK")) {
        console.log("Project Created");
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}
//createProject();

function deleteProject() {
  var projectName = "project 3";
  //.replace() to remove all the special characters
  var projectName_USER = projectName
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
    .toLowerCase();
  console.log(projectName_USER);
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
        console.log("There are no projets with that name.");
      } else {
        for (let i = 0; i < response.data.projects.length; i++) {
          //.replace() method to remove all the special characters
          var projectName_TW = response.data.projects[i].name;
          var projectName_TWLC = projectName_TW
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .toLowerCase();
          console.log("projectName_TWLC:" + projectName_TWLC);

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
      })
        .then(response => {
          console.log(response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    });
}

//deleteProject();
// function createTask() {
//   var projectName = "l.a. publishing company";

//   var projectName_USER = projectName
//     .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
//     .toLowerCase();
//   console.log(projectName_USER);

//   axios({
//     method: "get",
//     url: "https://alexalapraim.teamwork.com/projects.json?status=ACTIVE",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       Authorization: auth
//     }
//   }).then(response => {
//     // console.log(response.data.projects);
//     if (response.data.projects.length === 0) {
//       //this.response.speak("There are no projets with that name.");
//       //this.emit(":responseReady");
//     } else {
//       var projectId = "";
//       for (let i = 0; i < response.data.projects.length; i++) {
//         var projectName_TW = response.data.projects[i].name;
//         var projectName_TWLC = projectName_TW
//           .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
//           .toLowerCase();
//         console.log(projectName_TWLC);
//         if (projectName_TWLC === projectName_USER) {
//           projectId = response.data.projects[i].id;
//           break;
//         }
//         console.log(projectId);
//       }
//       return projectId;
//     }
//   });
//     .then(projectId => {
//       let newTask = {
//         "todo-items": {
//           content: "Add login info for the users"
//         }
//       };
//       axios({
//         method: "post",
//         url: "https://alexalapraim.teamwork.com/projects.json",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: auth
//         },
//         data: newTask
//       })
//         .then(function(response) {
//           console.log("Project Created");
//           console.log(response.data);
//         })
//         .catch(function(error) {
//           console.log(error);
//         });
//     });
//}

//createTask();
