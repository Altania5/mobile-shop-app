// client/src/utils/animations.js

export const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200; // The lower the slower

  const animate = (counter) => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(() => animate(counter), 1);
    } else {
      counter.innerText = target;
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });

  counters.forEach(counter => {
    observer.observe(counter);
  });
};

export const initScrollAnimations = () => {
  const animateElements = document.querySelectorAll('.feature-card, .stat-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
};
