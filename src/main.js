// === ১. থিম ম্যানেজমেন্ট ===
const htmlRoot = document.getElementById("htmlRoot");
const themeSwitch = document.getElementById("themeSwitch");

const applyTheme = (theme) => {
  htmlRoot.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

themeSwitch.addEventListener("click", () => {
  const newTheme =
    htmlRoot.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(newTheme);
});

applyTheme(localStorage.getItem("theme") || "light");

// === ২. ট্যারিফ ডাটা ===
const TARIFFS = {
  LT: {
    "LT-A: আবাসিক": { demandCharge: 42.0 },
    "LT-B: সেচ/অফিস কাজ ছাড়া পাওয়ার": { demandCharge: 42.0, flatRate: 5.25 },
    "LT-C1: শিল্প": { demandCharge: 48.0, flatRate: 10.76 },
    "LT-C2: নির্মাণ": { demandCharge: 120.0, flatRate: 15.15 },
    "LT-D1: শিক্ষা, ধর্মীয় ও দাতব্য প্রতিষ্ঠান এবং হাসপাতাল": {
      demandCharge: 60.0,
      flatRate: 7.55,
    },
    "LT-D2: রাস্তার বাতি ও পানির পাম্প": { demandCharge: 90.0, flatRate: 9.71 },
    "LT-D3: কমার্শিয়াল EV চার্জিং স্টেশন": {
      demandCharge: 90.0,
      flatRate: 9.62,
    },
    "LT-E: বাণিজ্যিক ও অফিস": { demandCharge: 90.0, flatRate: 13.01 },
    "LT-F: অস্থায়ী": { demandCharge: 120.0, flatRate: 20.17 },
  },
  MT: {
    "MT-1: আবাসিক": { demandCharge: 90.0, flat: 10.55 },
    "MT-2: বাণিজ্যিক ও অফিস": { demandCharge: 90.0, flat: 11.63 },
    "MT-3: শিল্প": { demandCharge: 90.0, flat: 10.88 },
    "MT-4: নির্মাণ": { demandCharge: 120.0, flat: 14.38 },
    "MT-5: সাধারণ": { demandCharge: 90.0, flat: 10.61 },
    "MT-6: অস্থায়ী": { demandCharge: 120.0, flatRate: 19.02 },
    "MT-7: কমার্শিয়াল EV চার্জিং স্টেশন": { demandCharge: 90.0, flat: 9.59 },
    "MT-8: সেচ/অফিস কাজ ছাড়া পাওয়ার": { demandCharge: 90.0, flat: 6.42 },
  },
  HT: {
    "HT-1: সাধারণ": { demandCharge: 90.0, flat: 10.61 },
    "HT-2: বাণিজ্যিক ও অফিস": { demandCharge: 90.0, flat: 11.39 },
    "HT-3: শিল্প": { demandCharge: 90.0, flat: 10.75 },
    "HT-4: নির্মাণ": { demandCharge: 90.0, flat: 13.37 },
  },
  EHT: {
    "EHT-1: সাধারণ (20–140 MW)": { demandCharge: 90.0, flat: 10.66 },
    "EHT-2: সাধারণ (>140 MW)": { demandCharge: 90.0, flat: 10.61 },
  },
};

const voltageSelect = document.getElementById("voltage");
const categorySelect = document.getElementById("category");
const billForm = document.getElementById("billForm");
const consumptionInput = document.getElementById("consumption");

// ৩. ক্যাটাগরি পপুলেট
function populateCategories() {
  const voltage = voltageSelect.value;
  categorySelect.innerHTML = "";
  if (TARIFFS[voltage]) {
    Object.keys(TARIFFS[voltage]).forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }
}

// ৪. অটো-ফিল (kWh Master থেকে)
function checkSharedUnits() {
  const sharedData = localStorage.getItem("myHomeUnits");
  if (sharedData) {
    const items = JSON.parse(sharedData);
    const total = items.reduce((sum, item) => sum + item.kwh, 0);
    if (total > 0) {
      consumptionInput.value = total.toFixed(2);
      consumptionInput.style.border = "2px solid var(--accent)";
    }
  }
}

// ৫. অংককে কথায় রূপান্তর (Bangla Word Converter)
function toBanglaWords(n) {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBn = (num) => num.toString().replace(/\d/g, (d) => banglaDigits[d]);

  let amount = parseFloat(n).toFixed(2);
  let [takaStr, paisaStr] = amount.split(".");

  let t = parseInt(takaStr);
  let p = parseInt(paisaStr);
  let result = "";

  if (t === 0) {
    result = "শূণ্য ";
  } else {
    // কোটি (Crore)
    if (t >= 10000000) {
      result += toBn(Math.floor(t / 10000000)) + " কোটি ";
      t %= 10000000;
    }
    // লক্ষ (Lakh)
    if (t >= 100000) {
      result += toBn(Math.floor(t / 100000)) + " লক্ষ ";
      t %= 100000;
    }
    // হাজার (Thousand)
    if (t >= 1000) {
      result += toBn(Math.floor(t / 100)) + " হাজার "; // আগের লজিকে ভুল ছিল, এখানে ১০০০ হবে
      // সরি, আগের বার হাজার এর লজিক ভুল ছিল। ফিক্সড নিচে:
    }
  }

  // আমি ফাংশনটি আরও নির্ভুলভাবে নিচে লিখে দিচ্ছি:
  return generateCleanWords(parseInt(takaStr), parseInt(paisaStr));
}

// এটি ব্যবহার করুন, এটি আরও নিখুঁত:
function generateCleanWords(taka, paisa) {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBn = (num) => num.toString().replace(/\d/g, (d) => banglaDigits[d]);

  let res = "";
  let t = taka;

  if (t >= 10000000) {
    res += toBn(Math.floor(t / 10000000)) + " কোটি ";
    t %= 10000000;
  }
  if (t >= 100000) {
    res += toBn(Math.floor(t / 100000)) + " লক্ষ ";
    t %= 100000;
  }
  if (t >= 1000) {
    res += toBn(Math.floor(t / 1000)) + " হাজার ";
    t %= 1000;
  }
  if (t >= 100) {
    res += toBn(Math.floor(t / 100)) + " শ ";
    t %= 100;
  }
  if (t > 0 || res === "") {
    res += toBn(t) + " ";
  }

  res += "টাকা";

  if (paisa > 0) {
    res += " " + toBn(paisa) + " পয়সা";
  }

  return res + " মাত্র";
}

// ৬. মেইন ক্যালকুলেশন
billForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const voltage = voltageSelect.value;
  const category = categorySelect.value;
  const consumption = parseFloat(consumptionInput.value);

  if (isNaN(consumption) || consumption < 0) return alert("সঠিক ইউনিট দিন!");

  const tariff = TARIFFS[voltage][category];
  let energyCharge = 0;
  let breakdownHTML = "";

  if (category === "LT-A: আবাসিক") {
    let units = consumption;
    const tiers = [
      { upTo: 50, rate: 4.633, label: "১ম ধাপ (০-৫০)" },
      { upTo: 25, rate: 5.26, label: "২য় ধাপ (৫১-৭৫)" },
      { upTo: 125, rate: 7.2, label: "৩য় ধাপ (৭৬-২০০)" },
      { upTo: 100, rate: 7.59, label: "৪র্থ ধাপ (২০১-৩০০)" },
      { upTo: 100, rate: 8.02, label: "৫ম ধাপ (৩০১-৪০০)" },
      { upTo: 200, rate: 12.67, label: "৬ষ্ঠ ধাপ (৪০১-৬০০)" },
      { upTo: Infinity, rate: 14.61, label: "৭ম ধাপ (৬০০+)" },
    ];

    breakdownHTML = `<div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 8px; font-size: 0.85rem;">
                        <p style="font-weight: 600; margin-bottom: 5px; color: var(--accent);">প্রাইস ব্রেকডাউন:</p>`;

    for (let tier of tiers) {
      if (units <= 0) break;
      let applicableUnits = Math.min(units, tier.upTo);
      let cost = applicableUnits * tier.rate;
      energyCharge += cost;
      units -= applicableUnits;
      breakdownHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                              <span>${tier.label}</span>
                              <span>৳${cost.toFixed(2)}</span>
                            </div>`;
    }
    breakdownHTML += `</div>`;
  } else {
    const rate = tariff.flatRate || tariff.flat || 0;
    energyCharge = consumption * rate;
    breakdownHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 10px;">রেট: ৳${rate} x ${consumption} ইউনিট</p>`;
  }

  const demandCharge = tariff.demandCharge;
  const subtotal = energyCharge + demandCharge;
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h2><i class="fas fa-file-invoice"></i> বিলের বিবরণ</h2>
    <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between;">
            <span>এনার্জি চার্জ:</span> <strong>৳${energyCharge.toFixed(
              2
            )}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span>ডিমান্ড চার্জ:</span> <strong>৳${demandCharge.toFixed(
              2
            )}</strong>
        </div>
        ${breakdownHTML}
        <hr style="border:0; border-top:1px solid var(--input-border); margin:10px 0;">
        <div style="display:flex; justify-content:space-between;">
            <span>ভ্যাট (৫%):</span> <span>৳${vat.toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <span style="font-weight:700;">সর্বমোট বিল:</span>
            <strong style="font-size:1.6rem; color:var(--accent);">৳${total.toFixed(
              2
            )}</strong>
        </div>
        <p style="text-align:right; font-size:0.95rem; color:var(--accent-dark); font-weight:600; margin-top:12px; line-height:1.4;">
            কথায়: ${toBanglaWords(total)}
        </p>
    </div>
  `;
  resultDiv.classList.remove("hidden");
  resultDiv.scrollIntoView({ behavior: "smooth" });
});

// ৭. ইনিশিয়ালাইজেশন
voltageSelect.addEventListener("change", populateCategories);
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  checkSharedUnits();
});
