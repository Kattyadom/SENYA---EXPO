const form = document.getElementById('interpreterForm');
const success = document.getElementById('successState');
const password = document.getElementById('password');
const toggle = document.getElementById('togglePassword');
const fileInput = document.getElementById('certificateFile');
const fileLabel = document.getElementById('fileLabel');
const bio = document.getElementById('bio');
const bioCount = document.getElementById('bioCount');

toggle.addEventListener('click', () => {
  const show = password.type === 'password';
  password.type = show ? 'text' : 'password';
  const icon = toggle.querySelector('i');
  icon.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
});

bio.addEventListener('input', () => bioCount.textContent = bio.value.length);

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return fileLabel.textContent = 'Upload certification';
  if (file.size > 5 * 1024 * 1024) {
    alert('The selected file is larger than 5 MB.');
    fileInput.value = '';
    return fileLabel.textContent = 'Upload certification';
  }
  fileLabel.textContent = file.name;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const languages = [...document.querySelectorAll('input[name="language"]:checked')].map(x => x.value);
  if (!languages.length) return alert('Please select at least one language or communication method.');

  const application = {
    id: `INT-${Date.now()}`,
    role: 'interpreter',
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    experience: Number(document.getElementById('experience').value),
    certification: document.getElementById('certification').value.trim(),
    languages,
    specialties: [...document.querySelectorAll('input[name="specialty"]:checked')].map(x => x.value),
    bio: bio.value.trim(),
    verificationStatus: 'pending',
    submittedAt: new Date().toISOString()
  };

  // Prototype only: password and uploaded document are intentionally NOT stored in localStorage.
  const apps = JSON.parse(localStorage.getItem('senyaInterpreterApplications')) || [];
  apps.push(application);
  localStorage.setItem('senyaInterpreterApplications', JSON.stringify(apps));

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
