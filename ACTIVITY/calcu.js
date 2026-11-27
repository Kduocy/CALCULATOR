(function () {
  var $ = function (i) {
    return document.getElementById(i);
  };

  /* =====================================================
     CALCULATOR  (may sound ito lang)
     ===================================================== */
  var cur = "0",
    tokens = [],
    fresh = true,
    lastOp = false;

  var files = ["RING.mp4", "WAWAYUT.mp4", "RINGWITHBARK.mp4", "AYAYAY.mp4", "daddy.mp4"];
  var sounds = files.map(function (f) {
    var a = new Audio();
    a.preload = "auto";
    a.src = f;
    return a;
  });
  var count = 0,
    playing = null;
  function playNext() {
    var a = sounds[count % sounds.length];
    count++;
    if (playing && playing !== a) playing.pause();
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
      l > 13 ? "34px" : l > 10 ? "44px" : l > 7 ? "56px" : "";
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
        t.splice(i - 1, 3, t[i] === "×" ? t[i - 1] * t[i + 1] : t[i - 1] / t[i + 1]);
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

  /* secret code: type 0818 then = opens the vault */
  var SECRET = "0818",
    codeBuf = "",
    vaultOpen = false;
  function handleKey(k) {
    if (/^[0-9]$/.test(k)) {
      codeBuf = (codeBuf + k).slice(-12);
    } else if (k === "=") {
      var hit = codeBuf === SECRET && tokens.length === 0;
      codeBuf = "";
      if (hit) {
        cur = "0";
        tokens = [];
        fresh = true;
        lastOp = false;
        show();
        openVault();
        return;
      }
    } else {
      codeBuf = "";
    }
    press(k);
  }

  $("pad").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    playNext(); /* sound: calculator lang */
    handleKey(b.dataset.k);
  });

  /* =====================================================
     TABS  (Cal sa kaliwa, BMI sa kanan — walang sound)
     ===================================================== */
  var mode = "cal";
  function setMode(m) {
    mode = m;
    $("viewCal").classList.toggle("active", m === "cal");
    $("viewBmi").classList.toggle("active", m === "bmi");
    $("tabCal").classList.toggle("on", m === "cal");
    $("tabBmi").classList.toggle("on", m === "bmi");
    $("brand").textContent = m === "cal" ? "Calculator" : "BMI Calculator";
  }
  $("tabCal").addEventListener("click", function () {
    setMode("cal");
  });
  $("tabBmi").addEventListener("click", function () {
    setMode("bmi");
  });

  /* keyboard: calculator mode lang */
  var keyMap = {
    "*": "×",
    "/": "÷",
    "-": "−",
    Enter: "=",
    Escape: "AC",
    Backspace: "AC",
  };
  document.addEventListener("keydown", function (e) {
    if (mode !== "cal" || vaultOpen) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = keyMap[e.key] || e.key;
    if (/^[0-9.+%=]$/.test(k) || k === "×" || k === "÷" || k === "−" || k === "AC") {
      e.preventDefault();
      playNext();
      handleKey(k);
      var btn = document.querySelector('#pad [data-k="' + k + '"]');
      if (btn) {
        btn.classList.add("press");
        setTimeout(function () {
          btn.classList.remove("press");
        }, 110);
      }
    }
  });

  /* =====================================================
     BMI  (WALANG sound dito) - WHO standard, metric only
     ===================================================== */
  var gender = "male";

  var CATS = [
    { max: 18.5, name: "Underweight", color: "#6fb0d8", range: "< 18.5", msg: "Your weight is below the healthy range. Eat enough nutritious food and consider talking to a nutritionist." },
    { max: 25, name: "Normal", color: "#7fb069", range: "18.5 – 24.9", msg: "Your weight is in the healthy range. Keep it up!" },
    { max: 30, name: "Overweight", color: "#e6b34a", range: "25 – 29.9", msg: "Your weight is slightly above the healthy range. Some exercise and mindful eating can help." },
    { max: 35, name: "Obese (Class I)", color: "#e8803f", range: "30 – 34.9", msg: "Your BMI is in the obese range. It's a good idea to consult a doctor or nutritionist." },
    { max: 40, name: "Obese (Class II)", color: "#e0603f", range: "35 – 39.9", msg: "Your BMI is high and carries health risks. Please see a doctor." },
    { max: Infinity, name: "Obese (Class III)", color: "#c8402f", range: "≥ 40", msg: "Your BMI is very high. We strongly recommend seeing a doctor." }
  ];
  var NORMAL_TOP = 24.9;

  var G_MIN = 10,
    G_MAX = 45;
  function gT(b) {
    return Math.max(0, Math.min(1, (b - G_MIN) / (G_MAX - G_MIN)));
  }
  function pt(t) {
    var a = ((180 - 180 * t) * Math.PI) / 180;
    return (100 + 80 * Math.cos(a)).toFixed(2) + " " + (100 - 80 * Math.sin(a)).toFixed(2);
  }
  function buildGauge() {
    var start = G_MIN,
      NS = "http://www.w3.org/2000/svg";
    var g = $("gaugeArcs");
    while (g.firstChild) g.removeChild(g.firstChild);
    CATS.forEach(function (c) {
      var end = Math.min(c.max, G_MAX);
      if (end <= start) return;
      var p = document.createElementNS(NS, "path");
      p.setAttribute("class", "seg-arc");
      p.setAttribute("stroke", c.color);
      p.setAttribute("d", "M " + pt(gT(start)) + " A 80 80 0 0 1 " + pt(gT(end)));
      g.appendChild(p);
      start = end;
    });
  }
  function buildLegend(activeName) {
    $("legend").innerHTML = CATS.map(function (c) {
      return (
        '<div class="' + (c.name === activeName ? "cur" : "") + '"><i style="background:' +
        c.color + '"></i>' + c.name + "<b>" + c.range + "</b></div>"
      );
    }).join("");
  }
  function category(b) {
    for (var i = 0; i < CATS.length; i++) if (b < CATS[i].max) return CATS[i];
    return CATS[CATS.length - 1];
  }

  function compute() {
    var kg = parseFloat($("bmiW").value),
      cm = parseFloat($("bmiH").value),
      err = $("bmiErr"),
      res = $("bmiRes"),
      m = cm / 100;

    if (!(kg > 0 && kg <= 500) || !(m >= 0.5 && m <= 2.6)) {
      err.textContent = "Enter a valid weight (kg) and height (cm).";
      err.hidden = false;
      res.hidden = true;
      return;
    }
    err.hidden = true;

    var b = kg / (m * m),
      c = category(b);
    $("bmiVal").textContent = b.toFixed(1);
    $("bmiCat").textContent = c.name;
    $("bmiCat").style.color = c.color;
    $("bmiMsg").textContent = c.msg;

    var lo = 18.5 * m * m,
      hi = NORMAL_TOP * m * m,
      inches = m / 0.0254,
      ideal = (gender === "male" ? 50 : 45.5) + 2.3 * Math.max(0, inches - 60);
    $("bmiRange").innerHTML =
      "Healthy weight for your height: <b>" + lo.toFixed(1) + " – " + hi.toFixed(1) + " kg</b><br>" +
      "Ideal weight (" + gender + "): <b>" + ideal.toFixed(1) + " kg</b>";

    buildGauge();
    buildLegend(c.name);
    res.hidden = false;

    var needle = $("needle");
    needle.style.transform = "rotate(0deg)";
    void needle.getBoundingClientRect();
    needle.style.transform = "rotate(" + (gT(b) * 180).toFixed(1) + "deg)";
  }

  document.querySelectorAll("#genSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      gender = b.dataset.gender;
      document.querySelectorAll("#genSeg button").forEach(function (x) {
        x.classList.toggle("on", x === b);
      });
      if (!$("bmiRes").hidden) compute();
    });
  });
  $("bmiGo").addEventListener("click", compute);
  ["bmiW", "bmiH"].forEach(function (id) {
    $(id).addEventListener("keydown", function (e) {
      if (e.key === "Enter") compute();
    });
  });

  /* =====================================================
     VAULT  (hidden photos / videos, stored on this device)
     ===================================================== */
  var vaultEl = $("vault"),
    vGrid = $("vGrid"),
    vEmpty = $("vEmpty"),
    vView = $("vView"),
    vViewBody = $("vViewBody"),
    DB = null,
    vUrls = [],
    viewingId = null,
    vItems = [];

  function vdb() {
    return new Promise(function (res, rej) {
      if (DB) return res(DB);
      if (!window.indexedDB) return rej(new Error("no idb"));
      var r = indexedDB.open("calcvault", 1);
      r.onupgradeneeded = function () {
        r.result.createObjectStore("items", { keyPath: "id", autoIncrement: true });
      };
      r.onsuccess = function () {
        DB = r.result;
        res(DB);
      };
      r.onerror = function () {
        rej(r.error);
      };
    });
  }
  function vtx(mode, fn) {
    return vdb().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction("items", mode),
          out = fn(t.objectStore("items"));
        t.oncomplete = function () {
          res(out && out.result);
        };
        t.onerror = function () {
          rej(t.error);
        };
      });
    });
  }
  function revokeAll() {
    vUrls.forEach(function (u) {
      URL.revokeObjectURL(u);
    });
    vUrls = [];
  }
  function renderVault() {
    return vtx("readonly", function (s) {
      return s.getAll();
    })
      .then(function (items) {
        vItems = items || [];
        revokeAll();
        vGrid.textContent = "";
        vItems.forEach(function (it) {
          var url = URL.createObjectURL(it.blob);
          vUrls.push(url);
          var tile = document.createElement("div");
          tile.className = "v-tile";
          var isVid = it.type.indexOf("video") === 0;
          var m = document.createElement(isVid ? "video" : "img");
          m.src = isVid ? url + "#t=0.1" : url;
          if (isVid) {
            m.muted = true;
            m.preload = "metadata";
          }
          tile.appendChild(m);
          if (isVid) {
            var b = document.createElement("span");
            b.className = "badge";
            b.textContent = "▶";
            tile.appendChild(b);
          }
          tile.addEventListener("click", function () {
            openView(it, url, isVid);
          });
          vGrid.appendChild(tile);
        });
        $("vCount").textContent = vItems.length ? " · " + vItems.length : "";
        vEmpty.hidden = vItems.length > 0;
        vGrid.hidden = vItems.length === 0;
      })
      .catch(function () {
        vEmpty.textContent = "Storage is not available in this browser.";
        vEmpty.hidden = false;
      });
  }
  function openView(it, url, isVid) {
    viewingId = it.id;
    vViewBody.textContent = "";
    var m = document.createElement(isVid ? "video" : "img");
    m.src = url;
    if (isVid) {
      m.controls = true;
      m.autoplay = true;
      m.playsInline = true;
    }
    vViewBody.appendChild(m);
    vView.hidden = false;
  }
  function closeView() {
    var v = vViewBody.querySelector("video");
    if (v) v.pause();
    vViewBody.textContent = "";
    vView.hidden = true;
    viewingId = null;
  }
  function openVault() {
    vaultOpen = true;
    vaultEl.hidden = false;
    renderVault();
  }
  function closeVault() {
    vaultOpen = false;
    closeView();
    vaultEl.hidden = true;
    vGrid.textContent = "";
    revokeAll();
  }

  $("vLock").addEventListener("click", closeVault);
  $("vClose").addEventListener("click", closeView);
  $("vDel").addEventListener("click", function () {
    if (viewingId == null) return;
    if (!confirm("Delete this item permanently?")) return;
    var id = viewingId;
    vtx("readwrite", function (s) {
      return s.delete(id);
    }).then(function () {
      closeView();
      renderVault();
    });
  });
  $("vFile").addEventListener("change", function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = "";
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return vtx("readwrite", function (s) {
          return s.add({ name: f.name, type: f.type || "image/jpeg", blob: f, added: Date.now() });
        });
      });
    });
    chain.then(renderVault);
  });
  document.addEventListener("keydown", function (e) {
    if (vaultOpen && e.key === "Escape") {
      if (!vView.hidden) closeView();
      else closeVault();
    }
  });
  /* auto-lock when the tab/app goes to the background */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && vaultOpen) closeVault();
  });

  show();
  setMode("cal");
})();
