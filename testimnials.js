
function loadTestimonials() {
    // Get all testimonials from localStorage, or empty array if none exist
    let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

    // Reference to container div
    let container = document.getElementById("userTestimonials");

    // Clear existing content
    container.innerHTML = "";
    for (let i = 0; i < testimonials.length; i++) {
        let t = testimonials[i];

        // Create a card for each testimonial
        let card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.padding = "10px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#f9f9f9";

        // Add username and comment
        card.innerHTML = `
            <strong>${t.username}</strong><br>
            <p>${t.comment}</p>
        `;

        // Append card to container
        container.appendChild(card);
    }
}
document.getElementById("testimonialForm").addEventListener("submit", function(e){
    e.preventDefault(); // Prevent page reload

    // Get input values
    let username = document.getElementById("username").value.trim();
    let comment = document.getElementById("comment").value.trim();

    // Retrieve existing testimonials
    let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

    // Add new testimonial
    testimonials.push({
        username: username,
        comment: comment
    });

    // Save updated testimonials back to localStorage
    localStorage.setItem("testimonials", JSON.stringify(testimonials));

    // Notify user
    alert("Thank you for your testimonial!");

    // Clear form inputs
    document.getElementById("testimonialForm").reset();

    // Reload testimonials
    loadTestimonials();
});

loadTestimonials();