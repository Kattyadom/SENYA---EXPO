/* =========================================================
   1. ACCOUNT TYPE ELEMENTS
========================================================= */

const accountTypeSection =
    document.getElementById(
        "accountTypeSection"
    );


const userRegisterSection =
    document.getElementById(
        "userRegisterSection"
    );


const userOption =
    document.getElementById(
        "userOption"
    );


const interpreterOption =
    document.getElementById(
        "interpreterOption"
    );


const changeAccount =
    document.getElementById(
        "changeAccount"
    );



/* =========================================================
   2. USER ACCOUNT OPTION
========================================================= */

userOption.addEventListener(
    "click",
    () => {

        /*
            Hide account selection
        */

        accountTypeSection.style.display =
            "none";


        /*
            Show user form
        */

        userRegisterSection.classList.add(
            "active"
        );


        /*
            Scroll to top
        */

        document
            .querySelector(".login-card")
            .scrollTo({

                top: 0,

                behavior: "smooth"

            });

    }
);



/* =========================================================
   3. INTERPRETER ACCOUNT OPTION
========================================================= */

interpreterOption.addEventListener(
    "click",
    () => {

        /*
            Interpreter uses its own
            professional registration.
        */

        window.location.href =
            "interpreter-register.html";

    }
);



/* =========================================================
   4. CHANGE ACCOUNT TYPE
========================================================= */

changeAccount.addEventListener(
    "click",
    () => {

        /*
            Hide form
        */

        userRegisterSection.classList.remove(
            "active"
        );


        /*
            Show account selection
        */

        accountTypeSection.style.display =
            "block";


        /*
            Scroll back
        */

        document
            .querySelector(".login-card")
            .scrollTo({

                top: 0,

                behavior: "smooth"

            });

    }
);



/* =========================================================
   5. PASSWORD ELEMENTS
========================================================= */

const registerPassword =
    document.getElementById(
        "registerPassword"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );



/* =========================================================
   6. SHOW / HIDE PASSWORD
========================================================= */

togglePassword.addEventListener(
    "click",
    () => {

        const passwordIsHidden =
            registerPassword.type ===
            "password";


        /*
            Change input type
        */

        registerPassword.type =
            passwordIsHidden
                ? "text"
                : "password";


        /*
            Change icon
        */

        const icon =
            togglePassword.querySelector(
                "i"
            );


        if (passwordIsHidden) {

            icon.classList.remove(
                "fa-eye"
            );


            icon.classList.add(
                "fa-eye-slash"
            );

        }

        else {

            icon.classList.remove(
                "fa-eye-slash"
            );


            icon.classList.add(
                "fa-eye"
            );

        }

    }
);



/* =========================================================
   7. REGISTER FORM
========================================================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );



/* =========================================================
   8. REGISTER USER
========================================================= */

registerForm.addEventListener(
    "submit",
    (event) => {

        /*
            Prevent form refresh
        */

        event.preventDefault();



        /* =============================================
           GET VALUES
        ============================================= */

        const firstName =
            document
                .getElementById(
                    "registerFirstName"
                )
                .value
                .trim();


        const lastName =
            document
                .getElementById(
                    "registerLastName"
                )
                .value
                .trim();


        const birthday =
            document
                .getElementById(
                    "registerBirth"
                )
                .value;


        const phone =
            document
                .getElementById(
                    "registerPhone"
                )
                .value
                .trim();


        const whatsapp =
            document
                .getElementById(
                    "registerWhatsapp"
                )
                .value
                .trim();


        const address =
            document
                .getElementById(
                    "registerAddress"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "registerEmail"
                )
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById(
                    "registerPassword"
                )
                .value;



        /* =============================================
           PASSWORD VALIDATION
        ============================================= */

        if (password.length < 6) {

            alert(
                "Password must have at least 6 characters."
            );

            return;

        }



        /* =============================================
           GET SAVED USERS
        ============================================= */

        const users =
            JSON.parse(
                localStorage.getItem(
                    "senyaUsers"
                )
            ) || [];



        /* =============================================
           CHECK EMAIL
        ============================================= */

        const existingUser =
            users.find(
                user =>
                    user.email === email
            );


        if (existingUser) {

            alert(
                "An account with this email already exists."
            );

            return;

        }



        /* =============================================
           CREATE USER OBJECT
        ============================================= */

        const newUser = {

            id:
                "USR-" +
                Date.now(),

            role:
                "user",

            firstName:
                firstName,

            lastName:
                lastName,

            birthday:
                birthday,

            phone:
                phone,

            whatsapp:
                whatsapp,

            address:
                address,

            email:
                email,

            password:
                password,

            createdAt:
                new Date().toISOString()

        };



        /* =============================================
           SAVE USER
        ============================================= */

        users.push(
            newUser
        );


        localStorage.setItem(
            "senyaUsers",
            JSON.stringify(users)
        );



        /* =============================================
           REMEMBER ME
        ============================================= */

        const rememberUser =
            document
                .getElementById(
                    "rememberUser"
                )
                .checked;


        if (rememberUser) {

            localStorage.setItem(
                "senyaRememberEmail",
                email
            );

        }



        /* =============================================
           SUCCESS
        ============================================= */

        alert(
            "Your SENYA account was created successfully!"
        );



        /* =============================================
           REDIRECT TO SIGN IN
        ============================================= */

        window.location.href =
            "signin.html";

    }
);