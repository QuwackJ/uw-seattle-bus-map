// get the element with the class "icon"
let icon = document.getElementsByClassName("icon")[0];

// add event listener for the 'click' event on the icon element
icon.addEventListener('click', responsive_control);

// function to control the responsiveness of the navigation bar
function responsive_control() {
    // get the element with the id "myTopNav"
    let x = document.getElementById("myTopNav");

    // check if the class name of the element is "topnav"
    if (x.className === "topnav") {
        // if it is, add the "responsive" class to the element
        x.className += " responsive";
    } else {
        // if it's not, remove the "responsive" class from the element
        x.className = "topnav";
    }
}
