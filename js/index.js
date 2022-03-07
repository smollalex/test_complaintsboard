const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

function addScrollTop() {
  const btnScrollTop = document.querySelector('.btn-scroll-top');
  let position = 0;
  window.addEventListener('scroll', function (e) {
    position = window.scrollY;
    if (position > 100) {
      btnScrollTop.classList.add('show')
    } else {
      btnScrollTop.classList.remove('show')
    }
  });
};
addScrollTop();

