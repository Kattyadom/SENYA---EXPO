document.addEventListener("DOMContentLoaded", () => {

    const stars = document.querySelectorAll(".star");
    const ratingValue = document.getElementById("ratingValue");
    const ratingText = document.getElementById("ratingText");
    const ratingForm = document.getElementById("ratingForm");
    const ratingMessage = document.getElementById("ratingMessage");

    const ratingLabels = {
        1: "Very bad",
        2: "Bad",
        3: "Good",
        4: "Very good",
        5: "Excellent"
    };

    let selectedRating = 0;

    stars.forEach(star => {

        star.addEventListener("mouseenter", () => {

            const value = Number(star.dataset.value);

            stars.forEach(item => {
                item.classList.toggle(
                    "active",
                    Number(item.dataset.value) <= value
                );
            });

            ratingText.textContent = ratingLabels[value];

        });

        star.addEventListener("mouseleave", () => {

            stars.forEach(item => {
                item.classList.toggle(
                    "active",
                    Number(item.dataset.value) <= selectedRating
                );
            });

            ratingText.textContent = selectedRating
                ? ratingLabels[selectedRating]
                : "Select a rating";

        });

        star.addEventListener("click", () => {

            selectedRating = Number(star.dataset.value);

            ratingValue.value = selectedRating;

            stars.forEach(item => {
                item.classList.toggle(
                    "active",
                    Number(item.dataset.value) <= selectedRating
                );
            });

            ratingText.textContent = ratingLabels[selectedRating];

        });

    });


    ratingForm.addEventListener("submit", event => {

        event.preventDefault();

        if (selectedRating === 0) {

            showMessage(
                ratingMessage,
                "Please select a rating before submitting.",
                "error"
            );

            return;
        }

        const comment = document
            .getElementById("ratingComment")
            .value
            .trim();

        if (!comment) {

            showMessage(
                ratingMessage,
                "Please leave a comment about your experience.",
                "error"
            );

            return;
        }

        const evaluation = {
            rating: selectedRating,
            comment: comment,
            date: new Date().toISOString()
        };

        const evaluations =
            JSON.parse(localStorage.getItem("senyaEvaluations")) || [];

        evaluations.push(evaluation);

        localStorage.setItem(
            "senyaEvaluations",
            JSON.stringify(evaluations)
        );

        showMessage(
            ratingMessage,
            "Your evaluation has been submitted successfully.",
            "success"
        );

        ratingForm.reset();

        selectedRating = 0;
        ratingValue.value = "";

        stars.forEach(star => {
            star.classList.remove("active");
        });

        ratingText.textContent = "Select a rating";

    });


    const supportForm = document.getElementById("supportForm");
    const supportMessage = document.getElementById("supportMessage");

    supportForm.addEventListener("submit", event => {

        event.preventDefault();

        const name = document
            .getElementById("supportName")
            .value
            .trim();

        const email = document
            .getElementById("supportEmail")
            .value
            .trim();

        const problem = document
            .getElementById("supportProblem")
            .value
            .trim();

        if (!name || !email || !problem) {

            showMessage(
                supportMessage,
                "Please complete all the fields.",
                "error"
            );

            return;
        }

        const request = {
            name: name,
            email: email,
            problem: problem,
            date: new Date().toISOString()
        };

        const requests =
            JSON.parse(localStorage.getItem("senyaSupportRequests")) || [];

        requests.push(request);

        localStorage.setItem(
            "senyaSupportRequests",
            JSON.stringify(requests)
        );

        showMessage(
            supportMessage,
            "Your support request has been sent successfully.",
            "success"
        );

        supportForm.reset();

    });


    function showMessage(element, message, type) {

        element.textContent = message;
        element.className = `form-message ${type}`;

        setTimeout(() => {
            element.className = "form-message";
            element.textContent = "";
        }, 5000);

    }

});