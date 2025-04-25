// Reset the form after submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    // Check if the form exists before adding the event listener
    // Prevents errors if the form is not present in the DOM
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevents the default form submission behavior
            // Clears form inputs after submission
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (input.type !== 'submit') { // Exclude submit button
                    input.value = ''; // Clear the input value
                }
            });
        });
    }
});
