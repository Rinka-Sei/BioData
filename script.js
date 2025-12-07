const { jsPDF } = window.jspdf;

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.innerText = input;
  return div.innerHTML.trim().replace(/<[^>]*>?/gm, "");
}

function gatherData() {
  const form = document.getElementById("bioDataForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    console.error("Form validation failed. PDF export aborted.");
    return null;
  }

  const firstName = sanitizeInput(document.getElementById("first_name").value);
  const lastName = sanitizeInput(document.getElementById("last_name").value);
  const dob = document.getElementById("birthdate").value;
  const gender = document.getElementById("gender").value;
  const nationality = sanitizeInput(document.getElementById("country").value);
  const email = sanitizeInput(document.getElementById("email").value);
  const phone = sanitizeInput(document.getElementById("phone_number").value);
  const address = sanitizeInput(document.getElementById("address_line1").value);
  const now = new Date();

  return {
    firstName,
    lastName,
    dob,
    gender,
    nationality,
    email,
    phone,
    address,
    now,
  };
}

function generateFilename(data, extension) {
  const datePart = data.now.toISOString().slice(0, 10).replace(/-/g, "");
  const timePart = [
    String(data.now.getHours()).padStart(2, "0"),
    String(data.now.getMinutes()).padStart(2, "0"),
    String(data.now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `${data.lastName}_${data.firstName}_${datePart}_${timePart}.${extension}`.toLowerCase();
}

function exportToJson() {
  const data = gatherData();
  if (!data) return;

  const filename = generateFilename(data, "json");

  const bioData = {
    personalDetails: {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dob,
      gender: data.gender,
      nationality: data.nationality,
    },
    contactInformation: {
      email: data.email,
      phoneNumber: data.phone,
      address: data.address,
    },
    exportDate: data.now.toISOString(),
  };

  const jsonString = JSON.stringify(bioData, null, 4);
  const blob = new Blob([jsonString], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  alert(`Data prepared for download! File name: ${filename}`);
}

function exportToPdf() {
  const data = gatherData();
  if (!data) return;

  const filename = generateFilename(data, "pdf");
  const template = document.getElementById("pdf-content-template");

  template.innerHTML = `
        <h1 style="color: #007bff; border-bottom: 3px solid #007bff; padding-bottom: 5px;">BIO-DATA DOCUMENT</h1>
        <p style="font-size: 0.8em; margin-bottom: 20px;">Export Date: ${data.now.toLocaleString()}</p>
        
        <h3>Personal Details</h3>
        <div class="pdf-field">
            <span class="pdf-label">First Name:</span>
            <span class="pdf-value">${data.firstName}</span>
        </div>
        <div class="pdf-field">
            <span class="pdf-label">Last Name:</span>
            <span class="pdf-value">${data.lastName}</span>
        </div>
        <div class="pdf-field">
            <span class="pdf-label">Date of Birth:</span>
            <span class="pdf-value">${data.dob}</span>
        </div>
        <div class="pdf-field">
            <span class="pdf-label">Gender:</span>
            <span class="pdf-value">${data.gender}</span>
        </div>
        <div class="pdf-field">
            <span class="pdf-label">Nationality:</span>
            <span class="pdf-value">${data.nationality}</span>
        </div>

        <h3>Contact Information</h3>
        <div class="pdf-field">
            <span class="pdf-label">Email Address:</span>
            <span class="pdf-value">${data.email}</span>
        </div>
        <div class="pdf-field">
            <span class="pdf-label">Phone Number:</span>
            <span class="pdf-value">${data.phone}</span>
        </div>
        <div class="pdf-field full-width" style="margin-top: 20px;">
            <span class="pdf-label" style="display: block; margin-bottom: 5px;">Permanent Address:</span>
            <span class="pdf-value address-field">${data.address}</span>
        </div>
    `;

  template.style.display = "block";

  html2canvas(template, {
    scale: 3,
    allowTaint: true,
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "in",
        format: "letter",
      });

      const pdfWidth = 8.5;
      const pdfHeight = 11;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      template.style.display = "none";
      pdf.save(filename);
      alert(`Data exported successfully as PDF! File name: ${filename}`);
    })
    .catch((error) => {
      template.style.display = "none";
      console.error("PDF generation error:", error);
      alert(
        "An error occurred during PDF generation. Please check the console.",
      );
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phone_number");
  const toggle = document.getElementById("dark-mode-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const currentTheme = localStorage.getItem("theme");
  if (
    currentTheme === "dark" ||
    (currentTheme === null && prefersDarkScheme.matches)
  ) {
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

  phoneInput.addEventListener("input", (e) => {
    const x = e.target.value
      .replace(/\D/g, "")
      .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2]
      ? x[1]
      : `(${x[1]}) ${x[2]}${x[3] ? `-${x[3]}` : ""}`;
  });

  const inputs = document.querySelectorAll(
    "#bioDataForm input, #bioDataForm textarea, #bioDataForm select",
  );
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.checkValidity()) {
        input.classList.remove("invalid");
      }
    });
  });
});
