/*
  Client-side validation + inline errors for the Fluent Forms embeds
  (Get Election Day Reminders, Contact, Volunteer, newsletter signup).
  Works standalone even if the Fluent Forms plugin bundle isn't loaded,
  and does not block a real submit once a form is valid.
*/
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+()\-.\s]{7,}$/;

  function fieldWrapper(input) {
    return input.closest('.ff-el-group') || input.closest('.ff-el-input--content') || input.parentElement;
  }

  function labelFor(input) {
    if (input.id) {
      var label = document.getElementById('label_' + input.id) || document.querySelector('label[for="' + input.id + '"]');
      if (label) return label.textContent.trim();
    }
    return input.getAttribute('aria-label') || input.getAttribute('placeholder') || 'This field';
  }

  function clearError(input) {
    var wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove('ff-el-is-error');
    input.setAttribute('aria-invalid', 'false');
    var msg = wrap.querySelector('.ff-custom-error');
    if (msg) msg.remove();
  }

  function setError(input, message) {
    var wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.add('ff-el-is-error');
    input.setAttribute('aria-invalid', 'true');
    var msg = wrap.querySelector('.ff-custom-error');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'ff-custom-error';
      msg.setAttribute('role', 'alert');
      var contentBox = input.closest('.ff-el-input--content') || wrap;
      contentBox.appendChild(msg);
      var errId = (input.id || 'ff_field') + '_error';
      msg.id = errId;
      var describedBy = input.getAttribute('aria-describedby');
      input.setAttribute('aria-describedby', describedBy ? describedBy + ' ' + errId : errId);
    }
    msg.textContent = message;
  }

  function validateField(input) {
    var value = (input.value || '').trim();
    var required = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';

    if (required && !value) {
      setError(input, labelFor(input) + ' is required.');
      return false;
    }
    if (value && input.type === 'email' && !EMAIL_RE.test(value)) {
      setError(input, 'Enter a valid email address.');
      return false;
    }
    if (value && input.getAttribute('data-name') === 'input_text' && input.type === 'text' && input.closest('[data-name]')) {
      // Loose phone check only applies to fields explicitly typed as phone via placeholder.
      var placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      if (placeholder.indexOf('phone') !== -1 && !PHONE_RE.test(value)) {
        setError(input, 'Enter a valid phone number.');
        return false;
      }
    }
    clearError(input);
    return true;
  }

  function validatableFields(form) {
    return Array.prototype.slice.call(
      form.querySelectorAll('input.ff-el-form-control, textarea.ff-el-form-control, select.ff-el-form-control')
    ).filter(function (el) {
      return el.type !== 'hidden';
    });
  }

  function initForm(form) {
    if (form.dataset.validationBound) return;
    form.dataset.validationBound = 'true';
    form.setAttribute('novalidate', 'novalidate');

    var fields = validatableFields(form);
    fields.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });
      input.addEventListener('input', function () {
        if (fieldWrapper(input) && fieldWrapper(input).classList.contains('ff-el-is-error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      var allValid = true;
      var firstInvalid = null;
      fields.forEach(function (input) {
        var ok = validateField(input);
        if (!ok) {
          allValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });
      if (!allValid) {
        event.preventDefault();
        event.stopPropagation();
        if (firstInvalid) firstInvalid.focus();
      }
    }, true); // capture: run before any plugin submit handler
  }

  function init() {
    document.querySelectorAll('form[id^="fluentform_"]').forEach(initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
