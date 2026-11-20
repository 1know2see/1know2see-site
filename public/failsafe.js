setTimeout(function () {
  var preloader = document.getElementById("preloader");
  if (preloader) preloader.remove();
  var locked = document.querySelectorAll("[inert]");
  for (var i = 0; i < locked.length; i++) locked[i].removeAttribute("inert");
}, 7000);
