document.addEventListener("DOMContentLoaded", function () {
    const scheduleBody = document.getElementById("scheduleBody");
    const activityModal = document.getElementById("activityModal");
    const saveActivityButton = document.getElementById("saveActivity");
    const activityNameInput = document.getElementById("activityName");
    const activityDurationInput = document.getElementById("activityDuration");

    let activities = JSON.parse(localStorage.getItem("activities")) || [];

    function generateSchedule() {
        scheduleBody.innerHTML = "";

        for (let hour = 0; hour < 24; hour++) {
            const timeLabel = document.createElement("div");
            timeLabel.classList.add("time-column");
            timeLabel.textContent = `${hour}:00`;
            scheduleBody.appendChild(timeLabel);

            for (let day = 0; day < 7; day++) {
                const slot = document.createElement("div");
                slot.classList.add("schedule-slot");
                slot.dataset.hour = hour;
                slot.dataset.day = day;

                slot.addEventListener("click", function () {
                    openActivityModal(day, hour);
                });

                scheduleBody.appendChild(slot);
            }
        }
        renderActivities();
    }

    function openActivityModal(day, hour) {
        activityModal.dataset.day = day;
        activityModal.dataset.hour = hour;
        activityModal.style.display = "block";
    }

    function closeModal() {
        activityModal.style.display = "none";
    }

    saveActivityButton.addEventListener("click", function () {
        const name = activityNameInput.value.trim();
        const duration = parseFloat(activityDurationInput.value);
        const day = activityModal.dataset.day;
        const hour = parseInt(activityModal.dataset.hour);

        if (!name || isNaN(duration) || duration <= 0) {
            alert("Please enter valid activity details.");
            return;
        }

        activities.push({ name, day, hour, duration });
        localStorage.setItem("activities", JSON.stringify(activities));

        closeModal();
        renderActivities();
    });

    function renderActivities() {
        document.querySelectorAll(".schedule-slot").forEach(slot => slot.innerHTML = "");

        activities.forEach(activity => {
            const startSlot = document.querySelector(`.schedule-slot[data-day="${activity.day}"][data-hour="${activity.hour}"]`);
            if (startSlot) {
                startSlot.innerHTML = `<div class="activity">${activity.name}</div>`;
            }
        });
    }

    generateSchedule();
});
