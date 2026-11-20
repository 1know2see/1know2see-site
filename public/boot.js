(function () {
  var lang = "zh";
  try {
    var saved = localStorage.getItem("1k2s-lang");
    if (saved === "en" || saved === "zh") lang = saved;
  } catch (error) {
    lang = "zh";
  }

  var root = document.documentElement;
  var page = root.getAttribute("data-page") || "home";
  root.setAttribute("data-lang", lang);
  root.setAttribute("lang", lang === "en" ? "en" : "zh-Hans");

  var titles = {
    home: {
      zh: "1know2see — 一只见二",
      en: "1know2see — Think deeper, see further",
    },
    "404": {
      zh: "未见 — 1know2see",
      en: "Unseen — 1know2see",
    },
  };
  var pack = titles[page] || titles.home;
  document.title = pack[lang];

  function sync() {
    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.setAttribute(
        "aria-pressed",
        button.getAttribute("data-set-lang") === lang ? "true" : "false",
      );
    }
    var labelled = document.querySelectorAll("[data-label-zh]");
    for (var j = 0; j < labelled.length; j++) {
      var node = labelled[j];
      var label =
        lang === "en"
          ? node.getAttribute("data-label-en")
          : node.getAttribute("data-label-zh");
      if (label) node.setAttribute("aria-label", label);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }
})();
