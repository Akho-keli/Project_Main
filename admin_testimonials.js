//This is a function that will load testimonials from localStorage and display them in the admin panel.
function loadAdminTestimonials() {
    // Get testimonials from localStorage
    let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

    // Get container div
    let container = document.getElementById("adminTestimonials");

    // Clear existing content
    container.innerHTML = "";

    // Loop through each testimonial using normal for loop
    for (let i = 0; i < testimonials.length; i++) {
        let t = testimonials[i];

        // These lines create  a card for a block container
        let card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.padding = "10px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#f0f0f0";

        // this line displays the username and comment
        card.innerHTML = `
            <strong>${t.username}</strong><br>
            <p>${t.comment}</p>
        `;

        // Append card to container
        container.appendChild(card);
    }
}
// Here we call the function to load testimonials when the page loads
loadAdminTestimonials();