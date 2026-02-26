document.addEventListener('sectionsLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitButton = document.getElementById('submitButton');
    const successMessage = document.getElementById('submitSuccessMessage');
    const errorMessage = document.getElementById('submitErrorMessage');

    // Email validation
    const emailInput = document.getElementById('email');
    const emailContainer = emailInput.closest('.mb-4');
    const emailFeedbackRequired = emailContainer.querySelector('.invalid-feedback:nth-of-type(1)');
    const emailFeedbackInvalid = emailContainer.querySelector('.invalid-feedback:nth-of-type(2)');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function updateEmailValidation() {
        const email = emailInput.value;
        if (!email) {
            emailInput.classList.add('is-invalid');
            emailFeedbackRequired.style.display = 'block';
            emailFeedbackInvalid.style.display = 'none';
            return false;
        } else if (!validateEmail(email)) {
            emailInput.classList.add('is-invalid');
            emailFeedbackRequired.style.display = 'none';
            emailFeedbackInvalid.style.display = 'block';
            return false;
        } else {
            emailInput.classList.remove('is-invalid');
            emailFeedbackRequired.style.display = 'none';
            emailFeedbackInvalid.style.display = 'none';
            return true;
        }
    }

    emailInput.addEventListener('input', updateEmailValidation);
    emailInput.addEventListener('blur', updateEmailValidation);

    // Enable submit button when form is valid (basic check)
    contactForm.addEventListener('input', () => {
        const isEmailValid = validateEmail(emailInput.value);
        const isFormValid = contactForm.checkValidity() && isEmailValid;

        if (isFormValid) {
            submitButton.classList.remove('disabled');
        } else {
            submitButton.classList.add('disabled');
        }
    });

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Final validation check
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        submitButton.classList.add('disabled');
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // Get Formspree ID from JSON content
            const configResponse = await fetch('content/contact.json');
            const config = await configResponse.json();
            const formspreeId = config.formspreeId || 'mnjbpgpw';

            const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                successMessage.classList.remove('d-none');
                errorMessage.classList.add('d-none');
                contactForm.reset();
                submitButton.classList.add('disabled');

                // Hide success message after 15 seconds with fade out
                setTimeout(() => {
                    successMessage.classList.add('fade-out');
                    setTimeout(() => {
                        successMessage.classList.add('d-none');
                        successMessage.classList.remove('fade-out');
                    }, 1000); // Wait for 1s transition
                }, 14000); // Start fade at 14s
            } else {
                const errorData = await response.json();
                console.error('Formspree error:', errorData);
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            errorMessage.classList.remove('d-none');
            successMessage.classList.add('d-none');
        } finally {
            submitButton.innerHTML = 'Send';
            if (contactForm.checkValidity()) {
                submitButton.classList.remove('disabled');
            }
        }
    });
});
