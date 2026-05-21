// This function loads pages into the iframe (child form)
function loadPage(page) {
    // Get the iframe element
    const frame = document.getElementById("contentFrame");

    // Change its source to the selected page
    frame.src = page;
}


/*This makes UI feel like a real application*/
const menuItems = document.querySelectorAll(".menu li");

menuItems.forEach((item) => {
    item.addEventListener("click", function () {

        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove("active"));

        // Add active class to clicked item
        this.classList.add("active");
    });
});