/* =========================================
   MEDQUEUE JAVASCRIPT
========================================= */


/* =========================
   PAGE NAVIGATION
========================= */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const pageName = item.dataset.page;

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        pages.forEach(page => {
            page.classList.remove("active");
        });

        const selectedPage = document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }

        document
            .getElementById("sidebar")
            .classList.remove("open");

    });

});


/* =========================
   MOBILE MENU
========================= */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });

}


/* =========================
   DATE
========================= */

function updateDate() {

    const dateElement =
        document.getElementById("dateDisplay");

    if (!dateElement) return;

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

}

updateDate();


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   PATIENT INITIALS
========================= */

function getInitials(name) {

    if (!name) return "P";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================
   PRIORITY TEXT
========================= */

function priorityText(priority) {

    switch (Number(priority)) {

        case 1:
            return "Critical";

        case 2:
            return "Serious";

        case 3:
            return "Moderate";

        default:
            return "Normal";
    }

}


/* =========================
   REFRESH QUEUE
========================= */

async function refreshQueue() {

    try {

        const response =
            await fetch("/queue");

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data =
            await response.json();

        updateDashboard(data);

        renderEmergencyQueue(
            data.emergency || []
        );

        renderWaitingQueue(
            data.waiting || []
        );

        renderHistory(
            data.history || []
        );

        document
            .getElementById("serverStatus")
            .textContent = "Online";

    }

    catch (error) {

        console.log("Backend not connected:", error);

        document
            .getElementById("serverStatus")
            .textContent = "Offline";

    }

}


/* =========================
   DASHBOARD
========================= */

function updateDashboard(data) {

    const emergency =
        data.emergency || [];

    const waiting =
        data.waiting || [];

    const history =
        data.history || [];

    const total =
        emergency.length +
        waiting.length +
        history.length;

    const critical =
        emergency.filter(
            patient => Number(patient.priority) === 1
        ).length;

    document.getElementById(
        "totalPatients"
    ).textContent = total;

    document.getElementById(
        "criticalPatients"
    ).textContent = critical;

    document.getElementById(
        "waitingPatients"
    ).textContent =
        emergency.length + waiting.length;

    document.getElementById(
        "treatedPatients"
    ).textContent =
        history.length;


    /* Next patient */

    const nextPatient =
        document.getElementById("nextPatient");

    if (emergency.length === 0) {

        nextPatient.innerHTML = `
            <div class="empty">
                No emergency patients waiting.
            </div>
        `;

        return;
    }

    const patient =
        emergency[0];

    nextPatient.innerHTML = `

        <div class="next-patient">

            <div class="avatar">
                ${getInitials(patient.name)}
            </div>

            <div>

                <strong>
                    ${escapeHTML(patient.name)}
                </strong>

                <small>
                    ID: ${escapeHTML(patient.id)}
                    • ${escapeHTML(patient.problem)}
                </small>

                <span class="priority p${patient.priority}">
                    ${priorityText(patient.priority)}
                </span>

            </div>

        </div>

    `;

}


/* =========================
   EMERGENCY QUEUE
========================= */

function renderEmergencyQueue(patients) {

    const table =
        document.getElementById("emergencyTable");

    if (!patients.length) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty">
                        No emergency patients.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        patients.map(patient => `

        <tr>

            <td>

                <div class="patient-cell">

                    <div class="avatar">
                        ${getInitials(patient.name)}
                    </div>

                    <div>

                        <b>
                            ${escapeHTML(patient.name)}
                        </b>

                        <small>
                            ${escapeHTML(patient.id)}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(patient.age)}
            </td>


            <td>
                ${escapeHTML(patient.problem)}
            </td>


            <td>

                <span class="priority p${patient.priority}">
                    ${priorityText(patient.priority)}
                </span>

            </td>


            <td>

                <button
                    class="treat-btn"
                    onclick="treatPatient('${encodeURIComponent(patient.id)}')">

                    Treat

                </button>

            </td>

        </tr>

    `).join("");

}


/* =========================
   WAITING QUEUE
========================= */

function renderWaitingQueue(patients) {

    const table =
        document.getElementById("waitingTable");

    if (!patients.length) {

        table.innerHTML = `

            <tr>

                <td colspan="4">

                    <div class="empty">
                        No patients in waiting queue.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        patients.map(patient => `

        <tr>

            <td>

                <div class="patient-cell">

                    <div class="avatar">
                        ${getInitials(patient.name)}
                    </div>

                    <div>

                        <b>
                            ${escapeHTML(patient.name)}
                        </b>

                        <small>
                            ${escapeHTML(patient.id)}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(patient.age)}
            </td>


            <td>
                ${escapeHTML(patient.problem)}
            </td>


            <td>

                <button
                    class="treat-btn"
                    onclick="treatPatient('${encodeURIComponent(patient.id)}')">

                    Treat

                </button>

            </td>

        </tr>

    `).join("");

}


/* =========================
   HISTORY
========================= */

function renderHistory(history) {

    const grid =
        document.getElementById("historyGrid");

    if (!history.length) {

        grid.innerHTML = `

            <div class="card">

                <div class="empty">
                    No treatment history available.
                </div>

            </div>

        `;

        return;
    }


    grid.innerHTML =
        history.map(patient => `

        <div class="history-card">

            <strong>
                ${escapeHTML(patient.name)}
            </strong>

            <small>
                Patient ID:
                ${escapeHTML(patient.id)}
            </small>

            <small>
                Age: ${escapeHTML(patient.age)}
                • ${escapeHTML(patient.gender)}
            </small>

            <p>
                ${escapeHTML(patient.problem)}
            </p>

            <span class="priority p${patient.priority}">
                ${priorityText(patient.priority)}
            </span>

        </div>

    `).join("");

}


/* =========================
   REGISTER PATIENT
========================= */

const patientForm =
    document.getElementById("patientForm");

if (patientForm) {

    patientForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const patient = {

                id: document
                    .getElementById("patientId")
                    .value.trim(),

                name: document
                    .getElementById("patientName")
                    .value.trim(),

                age: document
                    .getElementById("patientAge")
                    .value,

                gender: document
                    .getElementById("patientGender")
                    .value,

                problem: document
                    .getElementById("patientProblem")
                    .value.trim(),

                type: document
                    .getElementById("patientType")
                    .value,

                priority: document
                    .getElementById("patientPriority")
                    .value

            };


            try {

                const response =
                    await fetch("/add", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body:
                            new URLSearchParams(patient)

                    });


                const result =
                    await response.text();


                if (!response.ok) {

                    throw new Error(result);

                }


                document.getElementById(
                    "formMsg"
                ).innerHTML = `
                    <span style="color:#15966f">
                        ✓ Patient registered successfully.
                    </span>
                `;


                patientForm.reset();

                showToast(
                    "Patient registered successfully"
                );

                refreshQueue();

            }

            catch (error) {

                document.getElementById(
                    "formMsg"
                ).innerHTML = `
                    <span style="color:#d64550">
                        ${escapeHTML(error.message)}
                    </span>
                `;

            }

        }
    );

}


/* =========================
   TREAT PATIENT
========================= */

async function treatPatient(encodedId) {

    const id =
        decodeURIComponent(encodedId);

    try {

        const response =
            await fetch("/treat", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    new URLSearchParams({
                        id: id
                    })

            });


        const result =
            await response.text();


        if (!response.ok) {
            throw new Error(result);
        }


        showToast(
            "Patient treated successfully"
        );

        refreshQueue();

    }

    catch (error) {

        showToast(
            "Unable to treat patient"
        );

        console.error(error);

    }

}


/* =========================
   TREAT EMERGENCY BUTTON
========================= */

const treatEmergencyBtn =
    document.getElementById(
        "treatEmergencyBtn"
    );

if (treatEmergencyBtn) {

    treatEmergencyBtn.addEventListener(
        "click",
        async () => {

            try {

                const response =
                    await fetch("/treat", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body: ""

                    });


                const result =
                    await response.text();


                if (!response.ok) {

                    throw new Error(result);

                }


                showToast(
                    "Emergency patient treated"
                );

                refreshQueue();

            }

            catch (error) {

                showToast(
                    "No emergency patient available"
                );

            }

        }
    );

}


/* =========================
   SEARCH PATIENT
========================= */

const searchBtn =
    document.getElementById("searchBtn");

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchPatient
    );

}


async function searchPatient() {

    const id =
        document
            .getElementById("searchId")
            .value
            .trim();

    const result =
        document.getElementById(
            "searchResult"
        );


    if (!id) {

        result.innerHTML = `

            <div class="not-found">
                Please enter a Patient ID.
            </div>

        `;

        return;
    }


    try {

        const response =
            await fetch("/search", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    new URLSearchParams({
                        id: id
                    })

            });


        if (!response.ok) {

            result.innerHTML = `

                <div class="not-found">
                    Patient not found.
                </div>

            `;

            return;
        }


        const patient =
            await response.json();


        result.innerHTML = `

            <div class="found">

                <h3>
                    Patient Found ✓
                </h3>

                <p>
                    <b>ID:</b>
                    ${escapeHTML(patient.id)}
                </p>

                <p>
                    <b>Name:</b>
                    ${escapeHTML(patient.name)}
                </p>

                <p>
                    <b>Age:</b>
                    ${escapeHTML(patient.age)}
                </p>

                <p>
                    <b>Gender:</b>
                    ${escapeHTML(patient.gender)}
                </p>

                <p>
                    <b>Problem:</b>
                    ${escapeHTML(patient.problem)}
                </p>

                <p>
                    <b>Priority:</b>

                    <span class="priority p${patient.priority}">
                        ${priorityText(patient.priority)}
                    </span>

                </p>

            </div>

        `;

    }

    catch (error) {

        result.innerHTML = `

            <div class="not-found">
                Unable to connect to C server.
            </div>

        `;

    }

}


/* =========================
   INITIAL LOAD
========================= */

refreshQueue();


/* =========================
   AUTO REFRESH
========================= */

setInterval(
    refreshQueue,
    3000
);