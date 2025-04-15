// Ensure event storage is available
let events = JSON.parse(localStorage.getItem("events")) || {};

// Function to open modal for adding a new event
function openNewEventModal(date) {
    const eventModal = document.getElementById("eventModal");
    const eventDateInput = document.getElementById("eventDate");
    const eventNameInput = document.getElementById("eventName");
    const eventTypeSelect = document.getElementById("eventType");
    const reminderSelect = document.getElementById("reminder");
    const saveEventButton = document.getElementById("saveEvent");

    if (!eventModal || !eventDateInput || !eventNameInput || !eventTypeSelect || !reminderSelect || !saveEventButton) {
        console.error("Some modal elements are missing from the DOM.");
        return;
    }

    eventDateInput.value = date;
    eventNameInput.value = "";
    eventTypeSelect.value = "other";
    reminderSelect.value = "none";
    saveEventButton.setAttribute("data-edit", ""); // Clear edit mode
    eventModal.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    const currentMonthElement = document.getElementById("currentMonth");
    const daysContainer = document.getElementById("daysContainer");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const eventListModal = document.getElementById("eventListModal");
    const eventListContainer = document.getElementById("eventList");
    const eventModal = document.getElementById("eventModal");
    const saveEventButton = document.getElementById("saveEvent");

    let currentDate = new Date();

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthElement.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

        daysContainer.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            daysContainer.appendChild(emptyDiv);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement("div");
            dayDiv.textContent = day;

            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (year === new Date().getFullYear() && month === new Date().getMonth() && day === new Date().getDate()) {
                dayDiv.classList.add("today");
            }

            if (events[formattedDate] && events[formattedDate].length > 0) {
                dayDiv.classList.add("event-day");

                const eventIndicator = document.createElement("div");
                eventIndicator.classList.add("event-indicator");
                eventIndicator.style.background = getEventColor(events[formattedDate][0].type);
                dayDiv.appendChild(eventIndicator);
            }

            dayDiv.addEventListener("click", function () {
                showEventList(formattedDate);
            });

            daysContainer.appendChild(dayDiv);
        }
    }

    function getEventColor(type) {
        const colors = {
            meeting: "#ff5733",
            birthday: "#33a8ff",
            reminder: "#33ff77",
            other: "#ffcc33"
        };
        return colors[type] || colors["other"];
    }

    function showEventList(date) {
        const eventListModal = document.getElementById("eventListModal");
        const eventListContainer = document.getElementById("eventList");

        if (!eventListModal || !eventListContainer) {
            console.error("Event list modal or container is missing.");
            return;
        }

        eventListContainer.innerHTML = `<h3>Events on ${date}</h3>`;

        if (!events[date] || events[date].length === 0) {
            eventListContainer.innerHTML += `<p>No events.</p>`;
        } else {
            events[date].forEach((event, index) => {
                const eventItem = document.createElement("div");
                eventItem.classList.add("event-item");
                eventItem.style.borderLeft = `4px solid ${getEventColor(event.type)}`;

                eventItem.innerHTML = `
                <p>
                    <strong>${event.name}</strong> (${event.type})
                    <span class="delete-event" data-date="${date}" data-index="${index}">&times;</span>
                </p>
            `;

                eventListContainer.appendChild(eventItem);
            });

            // Add event listener for delete buttons
            document.querySelectorAll(".delete-event").forEach(button => {
                button.addEventListener("click", function () {
                    const eventDate = this.getAttribute("data-date");
                    const eventIndex = parseInt(this.getAttribute("data-index"));
                    deleteEvent(eventDate, eventIndex);
                });
            });
        }

        const addEventButton = document.createElement("button");
        addEventButton.textContent = "Add New Event";
        addEventButton.classList.add("add-event-button");
        addEventButton.addEventListener("click", function () {
            openNewEventModal(date);
        });

        eventListContainer.appendChild(addEventButton);

        eventListModal.style.display = "block";
    }


    function deleteEvent(date, index) {
        if (events[date]) {
            events[date].splice(index, 1);
            if (events[date].length === 0) {
                delete events[date]; // Remove empty date entry
            }
            localStorage.setItem("events", JSON.stringify(events));
            renderCalendar(); // Refresh calendar
            showEventList(date); // Refresh event listing modal
        }
    }

    prevMonthButton.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();

    document.querySelector(".close-btn").addEventListener("click", function () {
        eventModal.style.display = "none";
    });

    saveEventButton.addEventListener("click", function () {
        const eventName = document.getElementById("eventName").value.trim();
        const eventDate = document.getElementById("eventDate").value;
        const eventType = document.getElementById("eventType").value;
        const reminderType = document.getElementById("reminder").value;
        const editData = saveEventButton.getAttribute("data-edit");

        if (!eventName || !eventDate) {
            alert("Please enter a valid event name and date.");
            return;
        }

        if (editData) {
            const [editDate, index] = editData.split(",");
            events[editDate][index] = { name: eventName, type: eventType, reminder: reminderType };
            saveEventButton.removeAttribute("data-edit");
        } else {
            if (!events[eventDate]) {
                events[eventDate] = [];
            }
            events[eventDate].push({ name: eventName, type: eventType, reminder: reminderType });
        }

        localStorage.setItem("events", JSON.stringify(events));
        renderCalendar();
        showEventList(eventDate);
        eventModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === eventModal) {
            eventModal.style.display = "none";
        }
    });
});
