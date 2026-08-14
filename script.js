(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── The envelope ─────────────────────────────────────── */

  var scene = document.getElementById("envelopeScene");
  var envelope = document.getElementById("envelopeBtn");
  var opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    envelope.classList.add("is-open");
    envelope.disabled = true;

    var wait = reduced ? 0 : 1100;

    window.setTimeout(function () {
      scene.classList.add("is-open");
      document.body.classList.remove("is-sealed");
      window.scrollTo(0, 0);
    }, wait);

    window.setTimeout(function () {
      scene.remove();
    }, wait + 1000);
  }

  envelope.addEventListener("click", openEnvelope);

  /* ── Photos that aren't there yet ─────────────────────
     Hide the <img> so the frame reads as a blank pink panel
     instead of a broken-image icon. */

  document.querySelectorAll(".polaroid-window img").forEach(function (img) {
    function hide() {
      img.style.display = "none";
    }
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* ── Scroll reveals ───────────────────────────────────── */

  var revealables = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || reduced) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    revealables.forEach(function (el) {
      revealer.observe(el);
    });
  }

  /* ── The shade wash follows the chapter in view ─────────
     Whichever chapter owns the middle of the viewport sets the
     shade. Driven off scroll rather than IntersectionObserver so
     it can't miss a jump. */

  var chapters = Array.prototype.slice.call(
    document.querySelectorAll("[data-stage]")
  );
  var currentShade = "";
  var ticking = false;

  function paintStage() {
    ticking = false;
    var middle = window.innerHeight / 2;
    var active = null;

    for (var i = 0; i < chapters.length; i++) {
      var box = chapters[i].getBoundingClientRect();
      if (box.top <= middle && box.bottom >= middle) {
        active = chapters[i];
        break;
      }
      // past the middle already — keep the last one that qualified
      if (box.top > middle) break;
      active = chapters[i];
    }

    if (!active) return;
    var shade = active.dataset.stage;
    if (shade === currentShade) return;
    currentShade = shade;
    document.documentElement.style.setProperty("--stage", shade);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paintStage);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  paintStage();

  /* ── The gift ─────────────────────────────────────────── */

  var gift = document.getElementById("giftBox");
  var voucher = document.getElementById("voucher");
  var giftWrap = gift.closest(".gift");

  gift.addEventListener("click", function () {
    if (giftWrap.classList.contains("is-open")) return;

    giftWrap.classList.add("is-open");
    gift.disabled = true;
    voucher.setAttribute("aria-hidden", "false");

    window.setTimeout(
      function () {
        voucher.setAttribute("tabindex", "-1");
        voucher.focus({ preventScroll: true });
      },
      reduced ? 0 : 1050
    );
  });
})();
