// ===============================
// LPGShield Dashboard JavaScript
// ===============================


// WAIT UNTIL PAGE LOADS

document.addEventListener("DOMContentLoaded", () => {

    
    // ===============================
    // USERNAME
    // ===============================

    const userElement = document.getElementById("user");

    if(userElement){

        const username =
        localStorage.getItem("username") || "Operator";

        userElement.textContent = username;

    }



    // ===============================
    // MENU ACTIVE SYSTEM
    // ===============================

    const menuItems =
    document.querySelectorAll(".menu li");

    menuItems.forEach(item => {

        item.addEventListener("click", () => {

            // REMOVE ACTIVE CLASS

            menuItems.forEach(li => {
                li.classList.remove("active");
            });

            // ADD ACTIVE CLASS

            item.classList.add("active");

        });

    });




    const searchInput =
    document.querySelector(".search--box input");

    if(searchInput){

        searchInput.addEventListener("keyup", () => {

            const value =
            searchInput.value.toLowerCase();

            menuItems.forEach(item => {

                const text =
                item.innerText.toLowerCase();

                if(text.includes(value)){

                    item.style.display = "block";

                }

                else{

                    item.style.display = "none";

                }

            });

        });

    }



    // ===============================
    // LIVE CLOCK
    // ===============================

    const title =
    document.querySelector(".header--title span");

    function updateClock(){

        const now = new Date();

        const time =
        now.toLocaleTimeString([],{
            hour:'2-digit',
            minute:'2-digit',
            second:'2-digit'
        });

        if(title){

            title.textContent =
            `LIVE SYSTEM • ${time}`;

        }

    }

    setInterval(updateClock,1000);

    updateClock();

});




// ===============================
// PAGE LOADER FUNCTION
// ===============================

function loadPage(page){

    const frame =
    document.getElementById("contentFrame");

    if(frame){

        frame.src = page;

    }

}