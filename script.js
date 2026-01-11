const { jsPDF } = window.jspdf;

// 1. Helper: Clean HTML tags from strings
function sanitize(str) {
  const div = document.createElement("div");
  div.innerText = str || "";
  return div.innerHTML.trim();
}

// 2. Autocomplete Logic (Photon API - Free/No Key)
function initAutocomplete() {
  const input = document.getElementById("address_line1");
  const results = document.getElementById("autocomplete-results");
  let timeout = null;

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    const query = input.value;
    if (query.length < 3) { results.innerHTML = ""; return; }

    timeout = setTimeout(() => {
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          results.innerHTML = "";
          data.features.forEach(f => {
            const p = f.properties;
            const full = [p.name, p.street, p.city, p.country].filter(Boolean).join(", ");
            const item = document.createElement("div");
            item.innerHTML = `<strong>${p.name || ""}</strong> <small>${full}</small>`;
            item.onclick = () => { input.value = full; results.innerHTML = ""; };
            results.appendChild(item);
          });
        });
    }, 300);
  });
  document.addEventListener("click", (e) => { if (e.target !== input) results.innerHTML = ""; });
}

// 3. Data Gathering
function gatherData() {
  const form = document.getElementById("bioDataForm");
  if (!form.checkValidity()) { form.reportValidity(); return null; }

  return {
    firstName: sanitize(document.getElementById("first_name").value),
    lastName: sanitize(document.getElementById("last_name").value),
    dob: document.getElementById("birthdate").value,
    gender: document.getElementById("gender").value,
    height: document.getElementById("height").value,
    weight: document.getElementById("weight").value,
    bloodType: document.getElementById("blood_type").value,
    email: sanitize(document.getElementById("email").value),
    address: sanitize(document.getElementById("address_line1").value),
    now: new Date()
  };
}

// 4. Export Functions
function exportToPdf() {
  const data = gatherData();
  if (!data) return;

  const template = document.getElementById("pdf-content-template");
  template.innerHTML = `
    <div style="display:flex; align-items:center; border-bottom:2pt solid #007bff; padding-bottom:10px; margin-bottom:20px;">
        <img src="health-data.png" style="width:50px; height:50px; margin-right:15px;">
        <h1 style="margin:0; color:#007bff; font-family:sans-serif;">MEDICAL BIO-DATA</h1>
    </div>
    <div style="margin-bottom:20px;">
        <h3>Personal Details</h3>
        <p><strong>Full Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>DOB:</strong> ${data.dob} | <strong>Gender:</strong> ${data.gender}</p>
    </div>
    <div style="margin-bottom:20px;">
        <h3>Health Statistics</h3>
        <p><strong>Height:</strong> ${data.height} cm | <strong>Weight:</strong> ${data.weight} kg</p>
        <p><strong>Blood Type:</strong> ${data.bloodType || 'N/A'}</p>
    </div>
    <div>
        <h3>Contact & Address</h3>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Address:</strong> ${data.address}</p>
    </div>
    <p style="font-size:8pt; color:gray; margin-top:40px;">Generated on: ${data.now.toLocaleString()}</p>
  `;

  template.style.display = "block";
  html2canvas(template, { scale: 2 }).then(canvas => {
    const pdf = new jsPDF("p", "in", "letter");
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, "JPEG", 0.5, 0.5, 7.5, (canvas.height * 7.5) / canvas.width);
    pdf.save(`${data.lastName}_BioData.pdf`);
    template.style.display = "none";
  });
}

function exportToJson() {
  const data = gatherData();
  if (!data) return;

  const bioData = {
    personalDetails: {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dob,
      gender: data.gender,
    },
    healthStatistics: {
      height: data.height,
      weight: data.weight,
      bloodType: data.bloodType,
    },
    contactInformation: {
      email: data.email,
      address: data.address,
    },
    exportDate: data.now.toISOString(),
  };

  const blob = new Blob([JSON.stringify(bioData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "BioData.json";
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

// 5. Initialize
document.addEventListener("DOMContentLoaded", () => {
  initAutocomplete();
  const toggle = document.getElementById("dark-mode-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark" || (currentTheme === null && prefersDarkScheme.matches)) {
    document.body.classList.add("dark-mode");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
});