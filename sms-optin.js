/**
 * SMS Opt-In Modal
 * Vanilla JS implementation with accessibility features
 * - Focus trap
 * - ESC to close
 * - Click outside to close
 * - Form validation
 * - Return focus on close
 */

(function() {
  'use strict';

  // DOM Elements
  let modal = null;
  let backdrop = null;
  let closeBtn = null;
  let form = null;
  let openerBtn = null;
  let formPanel = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  // Phone validation regex - allows 10+ digits with optional +1, dashes, parentheses, spaces
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/;

  // Alternative simpler check: at least 10 digits
  function isValidPhone(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Initialize the modal
  function init() {
    backdrop = document.getElementById('optin-modal-backdrop');
    modal = document.getElementById('optin-modal');
    closeBtn = document.getElementById('optin-modal-close');
    form = document.getElementById('optin-form');
    formPanel = document.querySelector('.optin-form-panel');

    if (!backdrop || !modal) {
      console.warn('SMS Opt-In Modal: Required elements not found');
      return;
    }

    // Setup event listeners
    setupEventListeners();
  }

  function setupEventListeners() {
    // CTA button(s) to open modal
    document.querySelectorAll('[data-optin-trigger]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openerBtn = this;
        openModal();
      });
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Click outside (on backdrop)
    if (backdrop) {
      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
          closeModal();
        }
      });
    }

    // ESC key
    document.addEventListener('keydown', handleKeydown);

    // Form submission
    if (form) {
      form.addEventListener('submit', handleSubmit);

      // Real-time validation on blur
      const phoneInput = form.querySelector('#optin-phone');
      const emailInput = form.querySelector('#optin-email');

      if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
          validatePhone(this);
        });
        phoneInput.addEventListener('input', function() {
          clearError(this);
        });
      }

      if (emailInput) {
        emailInput.addEventListener('blur', function() {
          validateEmail(this);
        });
        emailInput.addEventListener('input', function() {
          clearError(this);
        });
      }
    }
  }

  function openModal() {
    if (!backdrop) return;

    // Add class to open
    backdrop.classList.add('is-open');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Update focusable elements
    updateFocusableElements();

    // Focus the first focusable element (or close button)
    setTimeout(() => {
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 50);

    // Set aria-hidden on main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.setAttribute('aria-hidden', 'true');
  }

  function closeModal() {
    if (!backdrop) return;

    // Remove class to close
    backdrop.classList.remove('is-open');

    // Restore body scroll
    document.body.style.overflow = '';

    // Remove aria-hidden from main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.removeAttribute('aria-hidden');

    // Return focus to opener button
    if (openerBtn) {
      openerBtn.focus();
    }

    // Reset form after close animation
    setTimeout(() => {
      resetForm();
    }, 300);
  }

  function resetForm() {
    if (form) {
      form.reset();
      // Clear all error states
      form.querySelectorAll('.optin-input').forEach(input => {
        input.classList.remove('error');
      });
      form.querySelectorAll('.optin-error-msg').forEach(msg => {
        msg.classList.remove('show');
      });
    }
    if (formPanel) {
      formPanel.classList.remove('success');
    }
  }

  function updateFocusableElements() {
    if (!modal) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
  }

  function handleKeydown(e) {
    if (!backdrop.classList.contains('is-open')) return;

    // ESC to close
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    // Tab trap
    if (e.key === 'Tab') {
      if (focusableElements.length === 0) return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const phoneInput = form.querySelector('#optin-phone');
    const emailInput = form.querySelector('#optin-email');

    let isValid = true;

    // Validate phone (required)
    if (!validatePhone(phoneInput)) {
      isValid = false;
    }

    // Validate email (required)
    if (!validateEmail(emailInput)) {
      isValid = false;
    }

    if (!isValid) {
      // Focus first invalid field
      const firstError = form.querySelector('.optin-input.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Success - show success state
    showSuccess();
  }

  function validatePhone(input) {
    if (!input) return true;

    const value = input.value.trim();
    const errorMsg = input.parentElement.querySelector('.optin-error-msg');

    if (!value) {
      showError(input, errorMsg, 'Phone number is required');
      return false;
    }

    if (!isValidPhone(value)) {
      showError(input, errorMsg, 'Please enter a valid US phone number (10+ digits)');
      return false;
    }

    clearError(input);
    return true;
  }

  function validateEmail(input) {
    if (!input) return true;

    const value = input.value.trim();
    const errorMsg = input.parentElement.querySelector('.optin-error-msg');

    if (!value) {
      showError(input, errorMsg, 'Email is required');
      return false;
    }

    if (!isValidEmail(value)) {
      showError(input, errorMsg, 'Please enter a valid email address');
      return false;
    }

    clearError(input);
    return true;
  }

  function showError(input, errorMsg, message) {
    if (input) {
      input.classList.add('error');
    }
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.classList.add('show');
    }
  }

  function clearError(input) {
    if (!input) return;
    input.classList.remove('error');
    const errorMsg = input.parentElement.querySelector('.optin-error-msg');
    if (errorMsg) {
      errorMsg.classList.remove('show');
    }
  }

  function showSuccess() {
    if (formPanel) {
      formPanel.classList.add('success');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally for manual control if needed
  window.SMSOptIn = {
    open: openModal,
    close: closeModal,
    reset: resetForm
  };

})();
