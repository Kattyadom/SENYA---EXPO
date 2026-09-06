document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceName = urlParams.get('service') || 'General Service';

    const serviceDisplay = document.getElementById('selectedService');
    if (serviceDisplay) {
        serviceDisplay.textContent = serviceName;
    }

    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const requestData = {
                service: serviceName,
                language: document.getElementById('languageType').value,
                details: document.getElementById('details').value,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('currentRequest', JSON.stringify(requestData));
            window.location.href = 'espera.html';
        });
    }
});