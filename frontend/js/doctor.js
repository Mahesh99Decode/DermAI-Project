// 🔐 Logout function
function logout() {
  localStorage.removeItem("dermAI_doctorName");
  localStorage.removeItem("role"); // 🔥 important

  window.location.href = "index.html";
}

// 🚀 On Page Load
document.addEventListener('DOMContentLoaded', () => {

  // 🔐 Protect doctor page
  const role = localStorage.getItem("role");
  if (role !== "doctor") {
    window.location.href = "index.html";
    return;
  }

  // 📅 Set current date
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }

  // 👨‍⚕️ Load doctor name
  const storedName = localStorage.getItem("dermAI_doctorName");

  if (storedName) {
    const profileName = document.getElementById("profileNameDisplay");
    const welcomeMessage = document.getElementById("welcomeMessageDisplay");

    if (profileName) profileName.innerText = storedName;
    if (welcomeMessage) welcomeMessage.innerText =
      "Welcome back, " + storedName + "!";
  }

  // 📝 Fetch and display upcoming appointments
  fetchBookings();
});

function fetchBookings() {
  fetch("https://dermai-project.onrender.com/api/bookings")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        populateAppointments(data.data);
      } else {
        console.error("Failed to fetch bookings:", data.message);
      }
    })
    .catch(err => console.error("Error fetching bookings:", err));
}

function populateAppointments(bookings) {
  const tbody = document.getElementById("appointmentsTableBody");
  if (!tbody) return;

  tbody.innerHTML = ""; // Clear existing rows

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-muted);">No upcoming appointments</td></tr>`;
    return;
  }

  bookings.forEach(booking => {
    // Determine status badge randomly or logically for demo purposes
    // since we don't have a status field in the DB yet
    const statusType = "upcoming"; 
    const statusText = "Upcoming";

    // Format date nicely
    const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = new Date(booking.appointment_date).toLocaleDateString(undefined, dateOpts);

    // Default icon
    let modeIcon = "fa-hospital-user";
    if (booking.consultation_mode.includes("Video")) {
      modeIcon = "fa-video";
    }

    const patientName = booking.patient_name || "Patient ID: " + booking.user_id;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="patient-cell">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=cbd5e1" class="patient-avatar">
          <div class="patient-info">
            <span class="patient-name">${patientName}</span>
            <span class="patient-id">Booking #${booking.id}</span>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 500;">${formattedDate}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">${booking.time_slot}</div>
      </td>
      <td>
        <div style="font-weight: 500;">${booking.specialist_type}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-solid ${modeIcon}"></i> ${booking.consultation_mode}</div>
      </td>
      <td>
        <span class="badge safe-badge" style="margin-bottom:0.3rem; display:inline-block;">Review Needed</span>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${booking.reason ? booking.reason.substring(0, 50) + (booking.reason.length > 50 ? '...' : '') : 'No reason provided'}</div>
      </td>
      <td><span class="status ${statusType}">${statusText}</span></td>
      <td>
        <button class="action-btn join-btn" onclick="startConsultation()" style="margin-bottom: 0.5rem;"><i class="fa-solid fa-calendar-check"></i> Details</button>
        <button class="action-btn" onclick="cancelBooking(${booking.id})" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;"><i class="fa-solid fa-xmark"></i> Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this appointment?")) {
    return;
  }

  fetch(`https://dermai-project.onrender.com/api/bookings/${bookingId}`, {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Appointment cancelled successfully.");
        fetchBookings(); // Refresh the table
      } else {
        alert("Failed to cancel: " + data.message);
      }
    })
    .catch(err => {
      console.error("Error cancelling booking:", err);
      alert("Error connecting to server. Please try again.");
    });
}

// 🎥 Start Consultation
function startConsultation() {
  const btn = event.currentTarget || document.querySelector('.join-btn');
  const originalHtml = btn.innerHTML;

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

  setTimeout(() => {
    alert("Starting secure video consultation...\n\n(This is a demo)");
    btn.innerHTML = originalHtml;
  }, 1000);
}