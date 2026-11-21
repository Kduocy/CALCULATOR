(function () {
  var $ = function (i) {
    return document.getElementById(i);
  };
  var cur = "0",
    tokens = [],
    fresh = true,
    lastOp = false;

  /* Sounds: bawat pindot ng button, paikot na 1→2→3→4 */
  var files = ["RING.mp4", "WAWAYUT.mp4", "RINGWITHBARK.mp4", "AYAYAY.mp4", "daddy.mp4"];
  var sounds = files.map(function (f) {
    var a = new Audio(f);
    a.preload = "auto";
    return a;
  });
  var count = 0,
    playing = null;
  function playNext() {
    var a = sounds[count % 5];
    count++;
    if (playing && playing !== a) {
      playing.pause();
    }
    playing = a;
    try {
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function fmt(n) {
    if (!isFinite(n)) return "Error";
    var s = String(parseFloat(n.toPrecision(12)));
    if (s.indexOf("e") > -1) return s;
    var p = s.split("."),
      neg = p[0][0] === "-";
    var i = p[0].replace("-", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + i + (p[1] ? "." + p[1] : "");
  }
  function show() {
    var disp;
    if (cur === "Error") disp = "Error";
    else if (cur.indexOf(".") > -1) {
      var a = cur.split(".");
      disp =
        (a[0] === "-" || a[0] === "-0" ? "-0" : fmt(parseFloat(a[0] || 0))) +
        "." +
        a[1];
    } else disp = cur === "-0" ? "-0" : fmt(parseFloat(cur));
    $("cur").textContent = disp;
    var l = disp.length;
    $("cur").style.fontSize =
      l > 13 ? "36px" : l > 10 ? "46px" : l > 7 ? "60px" : "76px";
    $("expr").textContent = tokens
      .map(function (x) {
        return typeof x === "number" ? fmt(x) : x;
      })
      .join(" ");
    var last = tokens[tokens.length - 1];
    document.querySelectorAll(".op").forEach(function (b) {
      b.classList.toggle("sel", lastOp && b.dataset.k === last);
    });
  }
  function evalT(a) {
    var t = a.slice(),
      i;
    for (i = 1; i < t.length; i += 2) {
      if (t[i] === "×" || t[i] === "÷") {
        t.splice(
          i - 1,
          3,
          t[i] === "×" ? t[i - 1] * t[i + 1] : t[i - 1] / t[i + 1],
        );
        i -= 2;
      }
    }
    var v = t[0];
    for (i = 1; i < t.length; i += 2) {
      v = t[i] === "+" ? v + t[i + 1] : v - t[i + 1];
    }
    return v;
  }
  function equals() {
    var t = tokens.slice();
    if (lastOp) t.pop();
    else t.push(parseFloat(cur));
    var r = evalT(t);
    var ex =
      t
        .map(function (x) {
          return typeof x === "number" ? fmt(x) : x;
        })
        .join(" ") + " =";
    cur = isFinite(r) ? String(parseFloat(r.toPrecision(12))) : "Error";
    tokens = [];
    lastOp = false;
    fresh = true;
    show();
    $("expr").textContent = ex;
  }
  function press(k) {
    if (cur === "Error" && k !== "AC") return;
    if (/^[0-9]$/.test(k)) {
      if (fresh) {
        cur = k;
        fresh = false;
      } else if (cur.replace(/[-.]/g, "").length < 12) {
        cur = cur === "0" ? k : cur === "-0" ? "-" + k : cur + k;
      }
      lastOp = false;
    } else if (k === ".") {
      if (fresh) {
        cur = "0.";
        fresh = false;
      } else if (cur.indexOf(".") < 0) cur += ".";
      lastOp = false;
    } else if (k === "AC") {
      cur = "0";
      tokens = [];
      fresh = true;
      lastOp = false;
    } else if (k === "±") {
      cur = cur[0] === "-" ? cur.slice(1) : "-" + cur;
      if (!lastOp) fresh = false;
    } else if (k === "%") {
      cur = String(parseFloat((parseFloat(cur) / 100).toPrecision(12)));
      fresh = true;
    } else if (k === "=") {
      equals();
      return;
    } else {
      if (lastOp) {
        tokens[tokens.length - 1] = k;
      } else {
        tokens.push(parseFloat(cur));
        tokens.push(k);
        lastOp = true;
        fresh = true;
      }
    }
    show();
  }
  function handle(k) {
    playNext();
    press(k);
  }
  $("pad").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) handle(b.dataset.k);
  });
  document.addEventListener("keydown", function (e) {
    var m = {
        "*": "×",
        "/": "÷",
        "-": "−",
        Enter: "=",
        Escape: "AC",
        Backspace: "AC",
      },
      k = m[e.key] || e.key;
    if (
      /^[0-9.+%=]$/.test(k) ||
      k === "×" ||
      k === "÷" ||
      k === "−" ||
      k === "AC"
    ) {
      e.preventDefault();
      handle(k);
    }
  });
  show();
})();
