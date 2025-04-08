t
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const contactForm = document.querySelector('#contact form');

contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Here you would typically handle form submission, e.g., send data to a server
  // For this example, we'll just log the values to the console
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Message:', message);

  // Optionally, you can reset the form or display a success message
  contactForm.reset();
  alert('Message sent successfully!'); 
});