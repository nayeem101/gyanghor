function smoothScrollTop(target) {
  let targetSec = document.querySelector(target);
  let distance = -(targetSec.offsetTop + window.pageYOffset);
  scrollBy({ top: distance, behavior: "smooth" });
}
function smoothScrollBottom(target) {
  let targetSec = document.querySelector(target);
  let distance = targetSec.offsetTop + window.pageYOffset;
  scrollBy({ top: distance, behavior: "smooth" });
}
