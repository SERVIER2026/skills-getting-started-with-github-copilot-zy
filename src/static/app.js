document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      
      // Clear and reset activity dropdown
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list with cancel buttons
        const participantsList = document.createElement("div");
        participantsList.className = "participants-list";
        
        if (details.participants.length > 0) {
          const strong = document.createElement("strong");
          strong.textContent = "Participants:";
          participantsList.appendChild(strong);
          
          const ul = document.createElement("ul");
          details.participants.forEach(email => {
            const li = document.createElement("li");
            
            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;
            li.appendChild(emailSpan);
            
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "cancel-btn";
            cancelBtn.textContent = "Cancel Registration";
            cancelBtn.setAttribute("aria-label", `Cancel registration for ${email} from ${name}`);
            cancelBtn.dataset.activity = name;
            cancelBtn.dataset.email = email;
            li.appendChild(cancelBtn);
            
            ul.appendChild(li);
          });
          participantsList.appendChild(ul);
        }

        const h4 = document.createElement("h4");
        h4.textContent = name;
        activityCard.appendChild(h4);
        
        const descP = document.createElement("p");
        descP.textContent = details.description;
        activityCard.appendChild(descP);
        
        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule: ";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(details.schedule));
        activityCard.appendChild(scheduleP);
        
        const availP = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability: ";
        availP.appendChild(availStrong);
        availP.appendChild(document.createTextNode(`${spotsLeft} spots left`));
        activityCard.appendChild(availP);
        
        if (details.participants.length > 0) {
          activityCard.appendChild(participantsList);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle cancel registration button clicks
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("cancel-btn")) {
      const activity = event.target.dataset.activity;
      const email = event.target.dataset.email;

      if (!confirm(`Are you sure you want to cancel registration for ${email} from ${activity}?`)) {
        return;
      }

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/cancel?email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (response.ok) {
          messageDiv.textContent = result.message;
          messageDiv.className = "success";
          // Refresh activities list immediately to reflect the cancellation
          fetchActivities();
        } else {
          messageDiv.textContent = result.detail || "An error occurred";
          messageDiv.className = "error";
        }

        messageDiv.classList.remove("hidden");

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } catch (error) {
        messageDiv.textContent = "Failed to cancel registration. Please try again.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        console.error("Error canceling registration:", error);
      }
    }
  });

  // Initialize app
  fetchActivities();
});
