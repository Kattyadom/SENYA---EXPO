document.addEventListener("DOMContentLoaded", () => {


    // ============================================
    // SERVICE SELECTED FROM PARTNER NETWORK
    // ============================================

    const selectedService =
        localStorage.getItem("senya_selected_service") ||
        "Selected Service";


    const serviceName =
        document.getElementById("serviceName");


    const serviceDescription =
        document.getElementById("serviceDescription");


    if (serviceName) {

        serviceName.textContent =
            selectedService;

    }


    if (serviceDescription) {

        serviceDescription.textContent =
            "Service selected from SENYA Partner Network";

    }



    // ============================================
    // DOM ELEMENTS
    // ============================================

    const reasonInput =
        document.getElementById("appointmentReason");


    const charCount =
        document.getElementById("characterCount");


    const btnYes =
        document.getElementById("interpreterYes");


    const btnNo =
        document.getElementById("interpreterNo");


    const languageSelect =
        document.getElementById("appointmentLanguage");


    const slotCards =
        document.querySelectorAll(".slot-card");


    const confirmBtn =
        document.getElementById("confirmAppointment");



    // ============================================
    // CONFIRMATION MODAL
    // ============================================

    const overlay =
        document.getElementById("confirmationOverlay");


    const backHomeBtn =
        document.getElementById("backHomeBtn");


    const summaryService =
        document.getElementById("summaryService");


    const summaryDate =
        document.getElementById("summaryDate");


    const summaryTime =
        document.getElementById("summaryTime");


    const summaryInterpreter =
        document.getElementById("summaryInterpreter");


    const summaryLanguage =
        document.getElementById("summaryLanguage");



    // ============================================
    // VARIABLES
    // ============================================

    let needsInterpreter = null;

    let selectedDate = null;

    let selectedTime = null;



    // ============================================
    // CHARACTER COUNTER
    // ============================================

    if (reasonInput && charCount) {

        reasonInput.addEventListener("input", () => {

            charCount.textContent =
                reasonInput.value.length;

        });

    }



    // ============================================
    // INTERPRETER SELECTION
    // ============================================

    if (btnYes && btnNo) {


        btnYes.addEventListener("click", () => {

            btnYes.classList.add("selected");

            btnNo.classList.remove("selected");

            needsInterpreter = "Yes";

        });



        btnNo.addEventListener("click", () => {

            btnNo.classList.add("selected");

            btnYes.classList.remove("selected");

            needsInterpreter = "No";

        });

    }



    // ============================================
    // SLOT SELECTION
    // ============================================

    slotCards.forEach(card => {


        card.addEventListener("click", () => {


            // Remove previous selection

            slotCards.forEach(c => {

                c.classList.remove("selected");

            });



            // Select current slot

            card.classList.add("selected");



            // Save date and time

            selectedDate =
                card.getAttribute("data-date");


            selectedTime =
                card.getAttribute("data-time");

        });

    });



    // ============================================
    // CONFIRM APPOINTMENT
    // ============================================

    if (confirmBtn) {


        confirmBtn.addEventListener("click", () => {


            const langVal =
                languageSelect
                    ? languageSelect.value
                    : "";



            // Interpreter validation

            if (needsInterpreter === null) {

                alert(
                    "Please indicate if you need an interpreter (Yes / No)."
                );

                return;

            }



            // Language validation

            if (!langVal) {

                alert(
                    "Please select your preferred language."
                );

                return;

            }



            // Slot validation

            if (!selectedDate || !selectedTime) {

                alert(
                    "Please select one of the available call center slots."
                );

                return;

            }



            // ====================================
            // APPOINTMENT DATA
            // ====================================

            const appointmentData = {

                service:
                    selectedService,

                reason:
                    reasonInput.value ||
                    "Not specified",

                interpreter:
                    needsInterpreter,

                language:
                    langVal,

                date:
                    selectedDate,

                time:
                    selectedTime,

                status:
                    "Scheduled"

            };



            // ====================================
            // SAVE APPOINTMENT
            // ====================================

            localStorage.setItem(
                "senya_appointment",
                JSON.stringify(appointmentData)
            );



            // ====================================
            // UPDATE SUMMARY
            // ====================================

            if (summaryService) {

                summaryService.textContent =
                    appointmentData.service;

            }


            if (summaryDate) {

                summaryDate.textContent =
                    appointmentData.date;

            }


            if (summaryTime) {

                summaryTime.textContent =
                    appointmentData.time;

            }


            if (summaryInterpreter) {

                summaryInterpreter.textContent =
                    appointmentData.interpreter;

            }


            if (summaryLanguage) {

                summaryLanguage.textContent =
                    appointmentData.language;

            }



            // ====================================
            // SHOW CONFIRMATION
            // ====================================

            if (overlay) {

                overlay.classList.add("show");

            }

        });

    }



    // ============================================
    // BACK TO HOME
    // ============================================

    if (backHomeBtn) {


        backHomeBtn.addEventListener("click", () => {

            window.location.href =
                "index.html";

        });

    }

});