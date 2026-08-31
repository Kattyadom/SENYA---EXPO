
document.addEventListener("DOMContentLoaded", function () {

    const appointmentBtn = document.getElementById("viewAppointmentBtn");
    const appointmentModal = document.getElementById("homeAppointmentOverlay");
    const closeBtn = document.getElementById("closeHomeAppointmentModal");

    const service = document.getElementById("modalService");
    const date = document.getElementById("modalDate");
    const time = document.getElementById("modalTime");
    const interpreter = document.getElementById("modalInterpreter");
    const language = document.getElementById("modalLanguage");

    const cancelBtn = document.getElementById("cancelAppointmentBtn");


    // ==========================================
    // VERIFICAR QUE LOS ELEMENTOS EXISTAN
    // ==========================================

    if (!appointmentBtn) {
        console.error("My Appointment button not found");
        return;
    }

    if (!appointmentModal) {
        console.error("Appointment modal not found");
        return;
    }


    // ==========================================
    // MOSTRAR BOTÓN SI HAY UNA CITA
    // ==========================================

    function checkAppointment() {

        const savedAppointment = localStorage.getItem("senya_appointment");

        console.log("Saved appointment:", savedAppointment);

        if (savedAppointment) {

            appointmentBtn.style.display = "flex";

        } else {

            appointmentBtn.style.display = "none";

        }
    }


    // ==========================================
    // ABRIR MY APPOINTMENT
    // ==========================================

    appointmentBtn.addEventListener("click", function () {

        const savedAppointment =
            localStorage.getItem("senya_appointment");


        if (!savedAppointment) {

            alert("You don't have a scheduled appointment.");

            return;
        }


        let appointment;

        try {

            appointment = JSON.parse(savedAppointment);

        } catch (error) {

            console.error("Error reading appointment:", error);

            alert("There was an error loading your appointment.");

            return;
        }


        // ==========================================
        // MOSTRAR INFORMACIÓN
        // ==========================================

        if (service) {
            service.textContent =
                appointment.service || "-";
        }

        if (date) {
            date.textContent =
                appointment.date || "-";
        }

        if (time) {
            time.textContent =
                appointment.time || "-";
        }

        if (interpreter) {
            interpreter.textContent =
                appointment.interpreter || "-";
        }

        if (language) {
            language.textContent =
                appointment.language || "-";
        }


        // ==========================================
        // ABRIR MODAL
        // ==========================================

        appointmentModal.style.display = "flex";
        appointmentModal.classList.add("show");

        setTimeout(function () {

            appointmentModal.style.opacity = "1";
            appointmentModal.style.visibility = "visible";

        }, 10);

    });


    // ==========================================
    // CERRAR MODAL
    // ==========================================

    if (closeBtn) {

        closeBtn.addEventListener("click", function () {

            appointmentModal.style.display = "none";
            appointmentModal.classList.remove("show");

        });

    }


    // ==========================================
    // CERRAR AL HACER CLICK AFUERA
    // ==========================================

    appointmentModal.addEventListener("click", function (event) {

        if (event.target === appointmentModal) {

            appointmentModal.style.display = "none";
            appointmentModal.classList.remove("show");

        }

    });


    // ==========================================
    // CANCELAR CITA
    // ==========================================

    if (cancelBtn) {

        cancelBtn.addEventListener("click", function () {

            localStorage.removeItem("senya_appointment");

            appointmentModal.style.display = "none";
            appointmentModal.classList.remove("show");

            appointmentBtn.style.display = "none";

        });

    }


    // ==========================================
    // COMPROBAR CITA AL CARGAR HOME
    // ==========================================

    checkAppointment();

});

