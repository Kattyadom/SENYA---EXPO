/* =========================
   ELEMENTS
========================= */

const editProfileButton = document.getElementById("editProfileButton");

const editModal = document.getElementById("editModal");

const closeModal = document.getElementById("closeModal");

const cancelButton = document.getElementById("cancelButton");

const modalOverlay = document.getElementById("modalOverlay");

const editProfileForm = document.getElementById("editProfileForm");

const availabilitySwitch = document.getElementById("availabilitySwitch");

const availabilityText = document.getElementById("availabilityText");



/* =========================
   OPEN MODAL
========================= */

editProfileButton.addEventListener("click", () => {

    editModal.classList.add("active");

});



/* =========================
   CLOSE MODAL
========================= */

function closeEditModal() {

    editModal.classList.remove("active");

}


closeModal.addEventListener("click", closeEditModal);

cancelButton.addEventListener("click", closeEditModal);

modalOverlay.addEventListener("click", closeEditModal);



/* =========================
   AVAILABILITY SWITCH
========================= */

availabilitySwitch.addEventListener("change", () => {

    if (availabilitySwitch.checked) {

        availabilityText.textContent = "Accepting requests";

    } else {

        availabilityText.textContent = "Not accepting requests";

    }

});



/* =========================
   UPDATE PROFILE
========================= */

editProfileForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const firstName = document
        .getElementById("editFirstName")
        .value
        .trim();


    const lastName = document
        .getElementById("editLastName")
        .value
        .trim();


    const email = document
        .getElementById("editEmail")
        .value
        .trim();


    const phone = document
        .getElementById("editPhone")
        .value
        .trim();


    const experience = document
        .getElementById("editExperience")
        .value;


    const certification = document
        .getElementById("editCertification")
        .value
        .trim();


    const bio = document
        .getElementById("editBio")
        .value
        .trim();



    /* UPDATE PAGE */

    document.getElementById("profileName").textContent =
        `${firstName} ${lastName}`;


    document.getElementById("profileEmail").textContent =
        email;


    document.getElementById("profilePhone").textContent =
        phone;


    document.getElementById("profileExperience").textContent =
        `${experience} years`;


    document.getElementById("profileCertification").textContent =
        certification;


    document.getElementById("profileBio").textContent =
        bio;



    /* SAVE PROTOTYPE DATA */

    const profile = {

        role: "interpreter",

        firstName,

        lastName,

        email,

        phone,

        experience,

        certification,

        bio,

        availability: availabilitySwitch.checked

    };


    localStorage.setItem(
        "senyaInterpreterProfile",
        JSON.stringify(profile)
    );


    closeEditModal();

});



/* =========================
   LOAD SAVED PROFILE
========================= */

window.addEventListener("DOMContentLoaded", () => {

    const savedProfile = localStorage.getItem(
        "senyaInterpreterProfile"
    );


    if (!savedProfile) {

        return;

    }


    const profile = JSON.parse(savedProfile);


    document.getElementById("profileName").textContent =
        `${profile.firstName} ${profile.lastName}`;


    document.getElementById("profileEmail").textContent =
        profile.email;


    document.getElementById("profilePhone").textContent =
        profile.phone;


    document.getElementById("profileExperience").textContent =
        `${profile.experience} years`;


    document.getElementById("profileCertification").textContent =
        profile.certification;


    document.getElementById("profileBio").textContent =
        profile.bio;


    availabilitySwitch.checked =
        profile.availability;


    availabilityText.textContent =
        profile.availability
            ? "Accepting requests"
            : "Not accepting requests";


    document.getElementById("editFirstName").value =
        profile.firstName;


    document.getElementById("editLastName").value =
        profile.lastName;


    document.getElementById("editEmail").value =
        profile.email;


    document.getElementById("editPhone").value =
        profile.phone;


    document.getElementById("editExperience").value =
        profile.experience;


    document.getElementById("editCertification").value =
        profile.certification;


    document.getElementById("editBio").value =
        profile.bio;

});
