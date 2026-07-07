/**
 * ============================================================
 *  Judy Lam & Steve Huang — Wedding Website
 *  rsvp.js  ·  RSVP form handling & confetti celebration
 * ============================================================
 *
 *  ── Google Sheets Backend Setup ──
 *
 *  1. Create a Google Sheet with columns matching the form
 *     fields (Name, Email, Attendance, MealChoice, Dietary,
 *     GuestCount, Message, etc.).
 *
 *  2. Open Extensions → Apps Script and paste a doPost()
 *     function that writes the incoming JSON to a new row.
 *     Example:
 *
 *       function doPost(e) {
 *         const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *         const data  = JSON.parse(e.postData.contents);
 *         sheet.appendRow([
 *           new Date(),
 *           data.name,
 *           data.email,
 *           data.attendance,
 *           data.meal,
 *           data.dietary,
 *           data.guestCount,
 *           data.message
 *         ]);
 *         return ContentService
 *           .createTextOutput(JSON.stringify({ status: 'success' }))
 *           .setMimeType(ContentService.MimeType.JSON);
 *       }
 *
 *  3. Deploy as a Web App (Execute as: Me, Access: Anyone).
 *
 *  4. Copy the deployment URL and replace the placeholder
 *     GOOGLE_SCRIPT_URL below.
 * ============================================================
 */

(function () {
  'use strict';

  // ── Replace with your deployed Google Apps Script URL ──
  const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';

  /* --------------------------------------------------------
   *  DOM References
   * ------------------------------------------------------ */

  const form           = document.getElementById('rsvp-form');
  if (!form) return;   // bail if no RSVP form on page

  const submitBtn      = form.querySelector('button[type="submit"], .rsvp-submit');
  const attendanceYes  = form.querySelector('input[name="attending"][value="yes"]');
  const attendanceNo   = form.querySelector('input[name="attending"][value="no"]');
  const conditionalFields = document.querySelectorAll(
    '#attending-fields, .conditional-fields'
  );
  const successMessage = document.querySelector('.rsvp-success, #rsvp-success');

  /* --------------------------------------------------------
   *  Conditional Field Visibility
   * ------------------------------------------------------ */

  /**
   * Show or hide form fields that only apply when the guest
   * is attending (meal preference, dietary needs, +1 count).
   */
  function toggleConditionalFields(attending) {
    conditionalFields.forEach((field) => {
      field.style.display = attending ? '' : 'none';

      // Remove "required" from hidden fields so validation doesn't block
      field.querySelectorAll('[required]').forEach((input) => {
        if (attending) {
          input.setAttribute('required', '');
        } else {
          input.removeAttribute('required');
          input.value = '';
        }
      });
    });
  }

  // Listen for attendance radio changes
  [attendanceYes, attendanceNo].forEach((radio) => {
    radio?.addEventListener('change', (e) => {
      toggleConditionalFields(e.target.value === 'yes');
    });
  });

  // Set initial state
  if (attendanceNo?.checked) {
    toggleConditionalFields(false);
  }

  /* --------------------------------------------------------
   *  Form Validation
   * ------------------------------------------------------ */

  /**
   * Returns true when all visible required fields have values.
   * Adds a visual 'invalid' class to empty ones.
   */
  function validateForm() {
    let valid = true;

    form.querySelectorAll('[required]').forEach((input) => {
      // Skip hidden / conditionally-removed fields
      if (input.offsetParent === null) return;

      const filled =
        input.type === 'radio'
          ? form.querySelector(`input[name="${input.name}"]:checked`)
          : input.value.trim() !== '';

      if (!filled) {
        input.classList.add('invalid');
        valid = false;
      } else {
        input.classList.remove('invalid');
      }
    });

    return valid;
  }

  /* --------------------------------------------------------
   *  Form Submission
   * ------------------------------------------------------ */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Gather data
    const data = {
      name:       form.querySelector('[name="name"]')?.value.trim(),
      email:      form.querySelector('[name="email"]')?.value.trim(),
      attending:  form.querySelector('[name="attending"]:checked')?.value,
      guests:     form.querySelector('[name="guests"]')?.value ?? '',
      meal:       form.querySelector('[name="meal"]')?.value ?? '',
      dietary:    form.querySelector('[name="dietary"]')?.value.trim() ?? '',
      song:       form.querySelector('[name="song"]')?.value.trim() ?? '',
      message:    form.querySelector('[name="message"]')?.value.trim() ?? '',
    };

    // Loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors', // Google Apps Script requires no-cors from browsers
      });

      // no-cors means we can't read the response, but if we get
      // here without throwing the request was accepted.
      handleSuccess();
    } catch (error) {
      console.error('RSVP submission error:', error);
      handleError();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  /* --------------------------------------------------------
   *  Success & Error Handling
   * ------------------------------------------------------ */

  function handleSuccess() {
    const attending = form.querySelector('[name="attending"]:checked')?.value;
    // Hide the form, show the appropriate thank-you message
    form.style.display = 'none';

    if (attending === 'yes') {
      const successEl = document.getElementById('rsvp-success');
      if (successEl) successEl.style.display = 'block';
      launchConfetti();
    } else {
      const declinedEl = document.getElementById('rsvp-declined');
      if (declinedEl) declinedEl.style.display = 'block';
    }
  }

  function handleError() {
    let errorEl = form.querySelector('.rsvp-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'rsvp-error';
      form.appendChild(errorEl);
    }
    errorEl.textContent =
      'Something went wrong. Please try again or contact us directly.';
    errorEl.style.display = 'block';
  }

  /* --------------------------------------------------------
   *  Confetti 🎊
   * ------------------------------------------------------ */

  /**
   * Spawns 100 confetti pieces that cascade down the viewport,
   * using wedding-palette colours (gold, red, cream).
   */
  function launchConfetti() {
    const COLORS = ['#D4A853', '#E8C97A', '#C41E3A', '#8B1A1A', '#FFF8F0'];
    const PIECE_COUNT = 100;
    const ANIMATION_DURATION = 3500; // ms

    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.setAttribute('aria-hidden', 'true');

    // Position the container to cover the full viewport
    Object.assign(container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: '10000',
    });

    for (let i = 0; i < PIECE_COUNT; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';

      const size  = Math.random() * 5 + 5;   // 5 – 10 px
      const left  = Math.random() * 100;      // 0 – 100 vw
      const delay = Math.random() * 1.5;      // 0 – 1.5 s
      const rotation = Math.random() * 360;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      Object.assign(piece.style, {
        position: 'absolute',
        top: '-10px',
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${1.5 + Math.random()}s ease-in ${delay}s forwards`,
        opacity: '1',
      });

      container.appendChild(piece);
    }

    document.body.appendChild(container);

    // Inject keyframes if they haven't been added yet
    if (!document.getElementById('confetti-keyframes')) {
      const style = document.createElement('style');
      style.id = 'confetti-keyframes';
      style.textContent = `
        @keyframes confetti-fall {
          0%   { transform: translateY(0)   rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Clean up after animation completes
    setTimeout(() => container.remove(), ANIMATION_DURATION);
  }
})();
