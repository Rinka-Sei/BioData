# Bio-Data Document Generator

A modern, client-side web application for collecting bio-data and exporting the results into a standardized JSON file or a beautifully styled, print-ready PDF document (US Letter size).

This project is built using vanilla HTML, CSS, and JavaScript, relying on CDN-hosted libraries (`jsPDF`, `html2canvas`) for advanced PDF generation capabilities.

## ✨ Features

- **Modern UI:** Styled with a clean, Material Design-inspired aesthetic.
- **Dark Mode:** Toggable feature with local storage persistence.
- **Data Validation:** Client-side form validation for required fields.
- **JSON Export:** Export collected data into a structured JSON file.
- **Stylized PDF Export:** Generates a high-quality, multi-page PDF document that mimics a filled-out form, using custom CSS layouting on a **US Letter** page size (8.5 x 11 in).
- **Input Masking:** Automatic formatting for the phone number field for improved user experience.

## 🚀 Deployment (GitHub Pages)

This application is entirely front-end and can be hosted anywhere that serves static files. GitHub Pages is the simplest way to deploy.

1.  **Clone the Repository:**

    ```bash
    git clone [YOUR_REPO_URL]
    cd bio-data-generator
    ```

2.  **Create Files:** Ensure the modular files are present in the root directory:
    - `index.html`
    - `style.css`
    - `script.js`
    - `README.md`

3.  **Commit and Push:**

    ```bash
    git add .
    git commit -m "Modularize project and add README"
    git push origin main
    ```

4.  **Enable GitHub Pages:**
    - Go to your GitHub repository settings.
    - Navigate to the **Pages** section.
    - Under "Source," select the branch you wish to deploy from (e.g., `main` or `master`) and set the folder to `/` (root).
    - Save. Your application will be live at a URL like `https://[USERNAME].github.io/[REPO_NAME]`.

## 💻 Usage

1.  **Fill the Form:** Enter the required personal and contact details.
2.  **Export Data:**
    - Click **`EXPORT JSON`** to download a machine-readable data file.
    - Click **`EXPORT PDF`** to generate and download the stylized, print-ready document.
3.  **Form Reset:** Click **`RESET FORM`** to clear all fields.
