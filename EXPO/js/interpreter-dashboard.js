/* =========================================================
   SENYA - INTERPRETER DASHBOARD
========================================================= */


/* =========================================================
   1. ELEMENTOS
========================================================= */

const availabilitySwitch =
    document.getElementById("availabilitySwitch");

const availabilityText =
    document.getElementById("availabilityText");

const availabilityMessage =
    document.getElementById("availabilityMessage");

const requestsList =
    document.getElementById("requestsList");

const requestCount =
    document.getElementById("requestCount");

const emptyRequests =
    document.getElementById("emptyRequests");

const sessionEmpty =
    document.getElementById("sessionEmpty");

const sessionCard =
    document.getElementById("sessionCard");

const sessionService =
    document.getElementById("sessionService");

const sessionDetails =
    document.getElementById("sessionDetails");

const finishButton =
    document.getElementById("finishButton");



/* =========================================================
   2. DATOS DE DEMOSTRACIÓN
========================================================= */

const requests = {

    1: {

        service: "BAC Credomatic",
        user: "Ariana F.",
        communication: "LESSA",
        assistance: "Debit card information"

    },

    2: {

        service: "ISSS",
        user: "Carlos M.",
        communication: "LESSA",
        assistance: "Medical appointment information"

    }

};


let currentSession = null;



/* =========================================================
   3. DISPONIBILIDAD
========================================================= */

availabilitySwitch.addEventListener(
    "change",
    updateAvailability
);


function updateAvailability() {

    if (availabilitySwitch.checked) {

        availabilityText.textContent =
            "Available";

        availabilityText.style.color =
            "#2563EB";

        availabilityMessage.textContent =
            "You can receive new requests.";

    }

    else {

        availabilityText.textContent =
            "Unavailable";

        availabilityText.style.color =
            "#64748B";

        availabilityMessage.textContent =
            "Turn your status on when you are ready to receive requests.";

    }


    localStorage.setItem(
        "senyaInterpreterAvailable",
        availabilitySwitch.checked
    );

}



/* =========================================================
   4. REQUESTS
========================================================= */

requestsList.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const card =
            button.closest(".request-card");


        const requestId =
            card.dataset.requestId;


        if (button.dataset.action === "accept") {

            acceptRequest(
                requestId,
                card
            );

        }


        if (button.dataset.action === "decline") {

            card.remove();
            updateRequestCount();

        }

    }
);



/* =========================================================
   5. ACCEPT REQUEST
========================================================= */

function acceptRequest(
    requestId,
    card
) {

    if (!availabilitySwitch.checked) {

        alert(
            "Set your status to Available first."
        );

        return;

    }


    if (currentSession) {

        alert(
            "Finish your current session before accepting another request."
        );

        return;

    }


    const request =
        requests[requestId];


    currentSession =
        request;


    sessionService.textContent =
        request.service;


    sessionDetails.textContent =
        `${request.user} · ${request.communication} · ${request.assistance}`;


    sessionEmpty.hidden =
        true;

    sessionCard.hidden =
        false;


    localStorage.setItem(
        "senyaActiveSession",
        JSON.stringify(request)
    );


    card.remove();

    updateRequestCount();


    document
        .getElementById("session")
        .scrollIntoView({
            behavior: "smooth"
        });

}



/* =========================================================
   6. REQUEST COUNTER
========================================================= */

function updateRequestCount() {

    const amount =
        requestsList.querySelectorAll(
            ".request-card"
        ).length;


    requestCount.textContent =
        `${amount} waiting`;


    if (amount === 0) {

        requestsList.hidden =
            true;

        emptyRequests.hidden =
            false;

    }

}



/* =========================================================
   7. FINISH SESSION
========================================================= */

finishButton.addEventListener(
    "click",
    () => {

        const finish =
            confirm(
                "Finish this session?"
            );


        if (!finish) {

            return;

        }


        currentSession = null;

        localStorage.removeItem(
            "senyaActiveSession"
        );


        sessionCard.hidden = true;
        sessionEmpty.hidden = false;

    }
);



/* =========================================================
   8. ACCESSIBILITY PANEL
========================================================= */

const accessibilityBtn =
    document.getElementById("accessibilityBtn");

const accessibilityPanel =
    document.getElementById("accessibilityPanel");

const closePanel =
    document.getElementById("closePanel");


accessibilityBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        accessibilityPanel.classList.add(
            "open"
        );

    }
);


closePanel.addEventListener(
    "click",
    () => {

        accessibilityPanel.classList.remove(
            "open"
        );

    }
);



/* =========================================================
   9. ACCESSIBILITY MODES
========================================================= */

document
    .getElementById("lowVisionBtn")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "low-vision"
            );

        }
    );


document
    .getElementById("dyslexiaBtn")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dyslexia"
            );

        }
    );


document
    .getElementById("speechBtn")
    .addEventListener(
        "click",
        () => {

            window.speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(
                    document.querySelector(
                        ".dashboard-page"
                    ).innerText
                );


            utterance.lang = "en-US";

            window.speechSynthesis.speak(
                utterance
            );

        }
    );



/* =========================================================
   10. TEXT SIZE
========================================================= */

const smallText =
    document.getElementById("smallText");

const normalText =
    document.getElementById("normalText");

const largeText =
    document.getElementById("largeText");


function resetTextButtons() {

    smallText.classList.remove("active");
    normalText.classList.remove("active");
    largeText.classList.remove("active");

    document.body.classList.remove(
        "text-small",
        "text-large"
    );

}


smallText.addEventListener(
    "click",
    () => {

        resetTextButtons();

        document.body.classList.add(
            "text-small"
        );

        smallText.classList.add(
            "active"
        );

    }
);


normalText.addEventListener(
    "click",
    () => {

        resetTextButtons();

        normalText.classList.add(
            "active"
        );

    }
);


largeText.addEventListener(
    "click",
    () => {

        resetTextButtons();

        document.body.classList.add(
            "text-large"
        );

        largeText.classList.add(
            "active"
        );

    }
);


document
    .getElementById("resetAccessibility")
    .addEventListener(
        "click",
        () => {

            document.body.classList.remove(
                "low-vision",
                "dyslexia",
                "text-small",
                "text-large"
            );


            resetTextButtons();

            normalText.classList.add(
                "active"
            );

        }
    );



/* =========================================================
   11. MOBILE MENU
========================================================= */

const menuToggle =
    document.getElementById("menuToggle");

const interpreterNav =
    document.getElementById("interpreterNav");


menuToggle.addEventListener(
    "click",
    () => {

        interpreterNav.classList.toggle(
            "mobile-open"
        );

    }
);



/* =========================================================
   12. LOAD DATA
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const savedAvailability =
            localStorage.getItem(
                "senyaInterpreterAvailable"
            );


        if (savedAvailability !== null) {

            availabilitySwitch.checked =
                savedAvailability === "true";

            updateAvailability();

        }


        const savedSession =
            localStorage.getItem(
                "senyaActiveSession"
            );


        if (savedSession) {

            currentSession =
                JSON.parse(savedSession);


            sessionService.textContent =
                currentSession.service;


            sessionDetails.textContent =
                `${currentSession.user} · ${currentSession.communication} · ${currentSession.assistance}`;


            sessionEmpty.hidden = true;
            sessionCard.hidden = false;

        }


        updateRequestCount();

    }
);
