var range = document.querySelector("#range");
var form = document.getElementById("formDataPage");
var settings = document.getElementById("settings");
var changeRooms = document.getElementById("changeRooms");

changeRooms.addEventListener("click", switchRooms); //new changes


function switchRooms() {
  let roomName = prompt("Please enter the room name", "Harry Potter"); // new

  if (roomName != null) {
    var url = new URL(window.location.href);//commit 2

    var search_params = url.searchParams;
    search_params.set("room", roomName);
    url.search = search_params.toString(); // commit 3
    var new_url = url.toString();
    location.replace(new_url);
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
  }
  return undefined;
}

range.addEventListener("input", function () {
  form.style.fontSize = range.value + "px";
});

settings.addEventListener("click", hideSettings);

function hideSettings() {
  if (document.getElementById("settingsForm").style.display == "none") {
    document.getElementById("settingsForm").style.display = "";
  } else {
    document.getElementById("settingsForm").style.display = "none";
  }
}
