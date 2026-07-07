/**
 * ============================================================
 *  Judy Lam & Steve Huang — Wedding Website
 *  honeymoon.js  ·  Honeymoon fund / registry cards
 * ============================================================
 *
 *  ── PayPal Setup ──
 *
 *  1. Go to https://www.paypal.me/ and create (or confirm)
 *     your PayPal.Me link.
 *
 *  2. Replace the PAYPAL_HANDLE constant below with your
 *     actual PayPal.Me username.
 *
 *  3. When a guest clicks "Gift This", a new tab opens to:
 *       https://paypal.me/YourHandle/75
 *     where 75 is the item amount. The guest completes
 *     payment on PayPal's site — no server-side integration
 *     required.
 * ============================================================
 */

(function () {
  'use strict';

  // ── Replace with your real PayPal.Me handle ──
  const PAYPAL_HANDLE = 'YOURPAYPALLINK';

  /* --------------------------------------------------------
   *  Fund Items Data
   * ------------------------------------------------------ */

  const fundItems = [
    {
      title: 'Romantic Dinner',
      desc:  'Treat us to a candlelit dinner at a beachside restaurant',
      amount: 75,
      icon:  '🍽️',
    },
    {
      title: 'Spa Experience',
      desc:  'Help us unwind with a couples spa day at the resort',
      amount: 100,
      icon:  '💆',
    },
    {
      title: 'Sunset Cruise',
      desc:  'Gift us a romantic sunset sailing experience',
      amount: 150,
      icon:  '⛵',
    },
    {
      title: 'Adventure Excursion',
      desc:  'Fund a thrilling snorkeling or hiking adventure',
      amount: 120,
      icon:  '🏄',
    },
    {
      title: 'Flight Upgrade',
      desc:  'Help us start our honeymoon in comfort and style',
      amount: 200,
      icon:  '✈️',
    },
    {
      title: 'Hotel Suite Upgrade',
      desc:  'Upgrade our stay to an oceanview suite',
      amount: 250,
      icon:  '🏨',
    },
    {
      title: 'Wine & Dine Experience',
      desc:  'Treat us to a wine tasting tour at a local vineyard',
      amount: 90,
      icon:  '🍷',
    },
    {
      title: 'Any Amount',
      desc:  'Every gift helps make our honeymoon dreams come true',
      amount: null,     // guest enters a custom amount
      icon:  '💝',
    },
  ];

  /* --------------------------------------------------------
   *  Build PayPal URL
   * ------------------------------------------------------ */

  /**
   * Returns the PayPal.Me URL for the given amount.
   * @param {number|string} amount — dollar amount (omit for handle-only link)
   */
  function paypalUrl(amount) {
    const base = `https://paypal.me/${PAYPAL_HANDLE}`;
    return amount ? `${base}/${amount}` : base;
  }

  /* --------------------------------------------------------
   *  Render Cards
   * ------------------------------------------------------ */

  function renderFundGrid() {
    const grid = document.getElementById('fund-grid');
    if (!grid) return;

    grid.innerHTML = '';  // clear any server-rendered placeholders

    fundItems.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'fund-card';

      // ── Card content ──
      const icon = document.createElement('span');
      icon.className = 'fund-icon';
      icon.textContent = item.icon;
      icon.setAttribute('aria-hidden', 'true');

      const title = document.createElement('h3');
      title.className = 'fund-title';
      title.textContent = item.title;

      const desc = document.createElement('p');
      desc.className = 'fund-desc';
      desc.textContent = item.desc;

      card.append(icon, title, desc);

      if (item.amount !== null) {
        // ── Fixed-amount card ──
        const amount = document.createElement('p');
        amount.className = 'fund-amount';
        amount.textContent = `$${item.amount}`;

        const btn = createGiftButton(() => {
          window.open(paypalUrl(item.amount), '_blank', 'noopener');
        });

        card.append(amount, btn);
      } else {
        // ── Custom-amount card ──
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'fund-custom-amount';

        const label = document.createElement('label');
        label.textContent = '$';
        label.className = 'fund-currency-label';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.step = '1';
        input.placeholder = 'Enter amount';
        input.className = 'fund-amount-input';
        input.setAttribute('aria-label', 'Custom gift amount in dollars');

        label.appendChild(input);
        inputWrapper.appendChild(label);

        const btn = createGiftButton(() => {
          const value = parseInt(input.value, 10);
          if (!value || value < 1) {
            input.classList.add('invalid');
            input.focus();
            return;
          }
          input.classList.remove('invalid');
          window.open(paypalUrl(value), '_blank', 'noopener');
        });

        // Remove invalid highlight on input change
        input.addEventListener('input', () => input.classList.remove('invalid'));

        card.append(inputWrapper, btn);
      }

      grid.appendChild(card);
    });
  }

  /* --------------------------------------------------------
   *  Helper: Gift Button
   * ------------------------------------------------------ */

  /**
   * Creates a styled "Gift This" button with a click handler.
   * @param {Function} onClick
   * @returns {HTMLButtonElement}
   */
  function createGiftButton(onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fund-btn';
    btn.textContent = 'Gift This';
    btn.addEventListener('click', onClick);
    return btn;
  }

  /* --------------------------------------------------------
   *  Init
   * ------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', renderFundGrid);
})();
