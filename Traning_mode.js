document.addEventListener("DOMContentLoaded", function () {

    const startBtn   = document.getElementById("startTraining");
    const hintBtn    = document.getElementById("hintBtn");
    const restartBtn = document.getElementById("restartScenario");
    const resetBtn   = document.getElementById("resetTraining");

    const statusText   = document.getElementById("trainingStatus");
    const questionText = document.getElementById("question");
    const optionsDiv   = document.getElementById("options");
    const feedbackText = document.getElementById("feedback");
    const hintText     = document.getElementById("hintText");
    const scoreText    = document.getElementById("score");
    const timerText    = document.getElementById("timer");
    const progressBar  = document.getElementById("progressBar");

    const OPTION_LABELS = ["A", "B", "C", "D"];

    let currentStep = 0;
    let score = 0;
    let timer;
    let timeLimit = 15;
    let selectedScenario;

    const scenarios = [
        {
            difficulty: "Easy",
            data: [
                {
                    question: "You smell gas. What's your first step?",
                    options: ["Switch on lights", "Turn off gas valve", "Ignore it"],
                    correct: 1,
                    hint: "Stop the gas supply before anything else."
                },
                {
                    question: "Gas valve is off. What do you do next?",
                    options: ["Open windows", "Use phone near cylinder", "Light a match"],
                    correct: 0,
                    hint: "Ventilation clears dangerous build-up."
                },
                {
                    question: "Area is ventilated. Final step?",
                    options: ["Stay inside", "Call for help", "Restart gas"],
                    correct: 1,
                    hint: "Get external expert help immediately."
                }
            ]
        },
        {
            difficulty: "Medium",
            data: [
                {
                    question: "Cylinder is overheating. First step?",
                    options: ["Turn off gas", "Touch cylinder", "Call a friend"],
                    correct: 0,
                    hint: "Eliminate the heat source first."
                },
                {
                    question: "Gas is off. What's next?",
                    options: ["Move away from heat", "Start the stove", "Pour water on it"],
                    correct: 0,
                    hint: "Keep a safe distance from the heat."
                },
                {
                    question: "You're at a safe distance. Final step?",
                    options: ["Call for help", "Ignore it", "Restart heating"],
                    correct: 0,
                    hint: "Notify trained experts immediately."
                }
            ]
        }
    ];

    //Load question 
    function loadQuestion() {

        clearInterval(timer);
        hintText.textContent = "";
        
        feedbackText.textContent = "";
        feedbackText.className = "feedback-text";

        const current = selectedScenario.data[currentStep];
        questionText.textContent = current.question;
        optionsDiv.innerHTML = "";

        let timeLeft = timeLimit;
        timerText.textContent = "Time left: " + timeLeft + "s";
        timerText.className = "timer-text";

        timer = setInterval(function () {
            timeLeft--;
            timerText.textContent = "Time left: " + timeLeft + "s";
            if (timeLeft <= 5) timerText.className = "timer-text urgent";

            if (timeLeft <= 0) {

                clearInterval(timer);

                feedbackText.textContent = "Time's up!";

                feedbackText.className = "feedback-text wrong";

                disableOptions();
                setTimeout(nextStep, 1200);
            }
        }, 1000);

        current.options.forEach(function (option, index) {

            const btn = document.createElement("button");

            btn.setAttribute("data-index", OPTION_LABELS[index]);

            btn.appendChild(document.createTextNode(option));

            btn.addEventListener("click", function () { checkAnswer(index); });
            optionsDiv.appendChild(btn);
        });

        const progress = (currentStep / selectedScenario.data.length) * 100;
        progressBar.style.width = progress + "%";
    }

    // Check answer 
    function checkAnswer(selectedIndex) {
        clearInterval(timer);
        disableOptions();

        const correctIndex = selectedScenario.data[currentStep].correct;
        const buttons = optionsDiv.querySelectorAll("button");

        if (selectedIndex === correctIndex) {
            feedbackText.textContent = "Correct!";
            feedbackText.className = "feedback-text correct";
            buttons[selectedIndex].style.background = "rgba(78,255,163,0.15)";
            buttons[selectedIndex].style.borderColor = "rgba(78,255,163,0.5)";
            buttons[selectedIndex].style.color = "#4effa3";
            score++;
        } else {
            feedbackText.textContent = "Wrong!";
            feedbackText.className = "feedback-text wrong";
            buttons[selectedIndex].style.background = "rgba(255,79,79,0.15)";
            buttons[selectedIndex].style.borderColor = "rgba(255,79,79,0.5)";
            buttons[selectedIndex].style.color = "#ff4f4f";
            // Show correct answer
            buttons[correctIndex].style.background = "rgba(78,255,163,0.1)";
            buttons[correctIndex].style.borderColor = "rgba(78,255,163,0.4)";
            buttons[correctIndex].style.color = "#4effa3";
        }

        scoreText.textContent = "Score: " + score;
        setTimeout(nextStep, 1200);
    }

    // Next step 
    function nextStep() {
        currentStep++;

        if (currentStep < selectedScenario.data.length) {
            loadQuestion();
        } else {
            clearInterval(timer);
            progressBar.style.width = "100%";
            timerText.textContent = "";
            optionsDiv.innerHTML = "";
            hintText.textContent = "";

            statusText.textContent = "Completed";
            statusText.className = "status-pill done";

            const total = selectedScenario.data.length;
            if (score <= 1) {
                questionText.textContent = `You scored ${score}/${total} — keep practising!`;
                feedbackText.textContent = "Needs improvement";
                feedbackText.className = "feedback-text wrong";
            } else {
                questionText.textContent = `Great work! You scored ${score}/${total}.`;
                feedbackText.textContent = "Well done!";
                feedbackText.className = "feedback-text correct";
            }
        }
    }

    // Disable options during feedback
    function disableOptions() {
        optionsDiv.querySelectorAll("button").forEach(b => {
            b.disabled = true;
            b.style.cursor = "default";
            b.style.transform = "none";
        });
    }

    // Start 
    startBtn.addEventListener("click", function () {
        selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        currentStep = 0;
        score = 0;

        statusText.textContent = selectedScenario.difficulty;
        statusText.className = "status-pill active";
        scoreText.textContent = "Score: 0";
        feedbackText.textContent = "";
        feedbackText.className = "feedback-text";

        loadQuestion();
    });

    // Hint 
    hintBtn.addEventListener("click", function () {
        if (!selectedScenario) return;
        hintText.textContent = " " + selectedScenario.data[currentStep].hint;
    });

    //Restart
    restartBtn.addEventListener("click", function () {
        if (!selectedScenario) return;
        currentStep = 0;
        score = 0;

        statusText.textContent = selectedScenario.difficulty;
        statusText.className = "status-pill active";
        scoreText.textContent = "Score: 0";
        feedbackText.textContent = "";
        feedbackText.className = "feedback-text";
        hintText.textContent = "";

        loadQuestion();
    });

    //Reset 
    resetBtn.addEventListener("click", function () {
        clearInterval(timer);
        currentStep = 0;
        score = 0;
        selectedScenario = null;

        statusText.textContent = "Not Started";
        statusText.className = "status-pill";
        questionText.textContent = "Press Start Training to begin.";
        optionsDiv.innerHTML = "";
        feedbackText.textContent = "";
        feedbackText.className = "feedback-text";
        hintText.textContent = "";
        scoreText.textContent = "";
        timerText.textContent = "";
        timerText.className = "timer-text";
        progressBar.style.width = "0%";
    });

});