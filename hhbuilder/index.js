"use strict";

// Elements
var ageField = document.getElementById("age");
var relField = document.getElementById("rel");
var smokerField = document.getElementById("smoker");

var addButton = document.getElementsByClassName("add")[0];
var formEle = document.getElementsByTagName("form")[0];
var submitButton = getSubmitButton();

function getSubmitButton() {
  var buttons = document.getElementsByTagName("button");
  for (var s = 0; s <= buttons.length; s++) {
    if (buttons[s].className !== "add") {
      buttons[s].id = "formSubmit";
      return buttons[s];
    }
  }
}

// ES5 Classes
function List() {
  this.items = [];
  this.element = document.getElementsByClassName("household")[0];
}
List.prototype.addItem = function (item) {
  this.element.appendChild(item.getElement());
  this.items.push(item);
};
List.prototype.getItem = function (listPosition) {
  return this.items[listPosition - 1];
};
List.prototype.editItem = function (position) {
  var targetItem = this.items[position - 1];
  targetItem.setEditingMode();
};
List.prototype.removeItem = function (position) {
  var removeItemIndex = position - 1;
  this.element.removeChild(this.element.children[removeItemIndex]);
  this.items.splice(removeItemIndex, 1);
  this.updatePositions();
  resetEntryForm();
};
List.prototype.getNewRowIndex = function () {
  return this.element.children.length + 1;
};
List.prototype.updatePositions = function () {
  for (var i = 0; i < this.items.length; i++) {
    var updateItem = this.items[i];
    updateItem.listPosition = i + 1;
  }
};
List.prototype.updateListElement = function (position) {
  var item = list.items[position - 1];
  // console.log("update list element", item, position);
  if (item) {
    var child = this.element.children[position - 1];
    this.element.replaceChild(item.getElement(), child);
  }
};
List.prototype.getJSONData = function () {
  var output = this.items.map(function (item) {
    return { age: item.age, relationship: item.rel, smoker: item.smoker };
  });
  return JSON.stringify(output);
};

function Item(listPosition) {
  this.listPosition = listPosition;
  this.age;
  this.rel;
  this.smoker;
  this.updateValues();
  this.doneEditingCallback;
}
Item.prototype.updateValues = function () {
  // console.log("update values", this);
  this.age = ageField.value;
  this.rel = relField.value;
  this.smoker = smokerField.checked ? "yes" : "no";
  list.updateListElement(this.listPosition);
};
Item.prototype.setEditingMode = function () {
  setEntryForm(this.age, this.rel, this.smoker);
  disableButtons();
  addDoneButton(this);
  this.doneEditingCallback = setListeners(this.listPosition);
};
Item.prototype.stopEditingMode = function () {
  removeDoneButton();
  enableButtons();
  resetEntryForm();
  this.doneEditingCallback();
};
Item.prototype.getElement = function () {
  var ele = document.createElement("li");
  ele.innerHTML = this.getHTML();
  return ele;
};
Item.prototype.getHTML = function () {
  return (
    "Age: " +
    this.age +
    "&nbsp;&nbsp;&nbsp;&nbsp; Relationship: " +
    this.rel +
    "&nbsp;&nbsp;&nbsp;&nbsp; Smoker: " +
    this.smoker +
    "&nbsp;&nbsp;&nbsp; <button class='edit' onClick='list.editItem(" +
    this.listPosition +
    ")'>edit</button>" +
    "&nbsp;&nbsp;&nbsp; <button class='remove' onClick='list.removeItem(" +
    this.listPosition +
    ")'>remove</button>"
  );
};

// Trackers
var list = new List();

// Listeners
addButton.addEventListener("click", function () {
  if (validateDataEntry()) {
    addPersonToList();
  }
});

formEle.addEventListener("submit", function (e) {
  e.preventDefault();
  if (e.submitter.id === "formSubmit") {
    // console.log("Submit", e);
    onSubmit();
  }
});

function setListeners(listPosition) {
  function method(e) {
    e.preventDefault();
    var item = list.getItem(listPosition);
    // console.log("listener setup", item, listPosition);
    if (validateDataEntry()) {
      item.updateValues();
    }
  }
  ageField.addEventListener("keyup", method);
  relField.addEventListener("change", method);
  smokerField.addEventListener("click", method);
  return function () {
    ageField.removeEventListener("keyup", method);
    relField.removeEventListener("change", method);
    smokerField.removeEventListener("click", method);
  };
}

// UI Interactions

function addPersonToList() {
  // - Add people to a growing household list
  list.addItem(new Item(list.getNewRowIndex()));
  resetEntryForm();
}

function setEntryForm(age, rel, smoker) {
  ageField.value = age;
  relField.value = rel;
  smokerField.checked = smoker === "yes";
}

function resetEntryForm() {
  // - Reset the entry form after each addition
  ageField.value = "";
  relField.value = "";
  smokerField.checked = false;
  removeAllErrors();
}

function onSubmit() {
  // - Serialize the household as JSON upon form submission as a fake trip to the server
  var jsonData = list.getJSONData();

  var debug = document.getElementsByClassName("debug")[0];
  debug.innerHTML = jsonData;
  debug.setAttribute("style", "display: block; white-space: break-spaces");

  sendData(jsonData);
}

function sendData(data) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementsByClassName("debug")[0].innerHTML =
        xhttp.responseText;
    }
  };
  xhttp.open("POST", "http://localhost", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(data);
}

// Helper methods
function validateDataEntry() {
  // - Validate data entry (age is required and > 0, relationship is required)
  // - Follow industry accessibility guidelines for form validation
  var isValid = true;
  if (!ageField.value || ageField.value <= 0 || isNaN(ageField.value)) {
    setError(ageField);
    isValid = false;
  } else {
    removeError(ageField);
  }
  if (!relField.value) {
    setError(relField);
    isValid = false;
  } else {
    removeError(relField);
  }
  return isValid;
}

function setError(element) {
  element.setAttribute("style", "border-color: red");
  element.setAttribute("aria-invalid", "true");
}

function removeError(element) {
  element.removeAttribute("style", "border-color: red");
  element.setAttribute("aria-invalid", "false");
}

function removeAllErrors() {
  removeError(ageField);
  removeError(relField);
}

function enableButtons() {
  var allButtons = document.getElementsByTagName("button");
  for (var a = 0; a < allButtons.length; a++) {
    allButtons[a].removeAttribute("disabled");
  }
}

function disableButtons() {
  var allButtons = document.getElementsByTagName("button");
  for (var a = 0; a < allButtons.length; a++) {
    allButtons[a].setAttribute("disabled", "true");
  }
}

function addDoneButton(item) {
  var doneButton = document.createElement("button");
  doneButton.textContent = "Done";
  doneButton.id = "done";
  doneButton.onclick = function () {
    item.stopEditingMode();
  };
  addButton.parentNode.appendChild(doneButton);
}

function removeDoneButton() {
  var doneButton = document.getElementById("done");
  doneButton.remove();
}
