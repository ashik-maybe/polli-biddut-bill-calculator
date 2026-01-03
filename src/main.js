// ===== THEME SYSTEM =====
const htmlRoot = document.getElementById("htmlRoot");
const themeSwitch = document.getElementById("themeSwitch");

// Detect user preference
const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Check localStorage for manual override
const savedTheme = localStorage.getItem("theme");
let currentTheme = savedTheme || (userPrefersDark ? "dark" : "light");

// Apply theme
htmlRoot.setAttribute("data-theme", currentTheme);

// Toggle theme
themeSwitch.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  htmlRoot.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
});

// ===== TARIFF DATA =====
const TARIFFS = {
  LT: {
    "LT-A: আবাসিক": {
      demandCharge: 42.0,
      tiers: [
        { upTo: 50, rate: 4.633 },
        { upTo: 75, rate: 5.26 },
        { upTo: 200, rate: 7.2 },
        { upTo: 300, rate: 7.59 },
        { upTo: 400, rate: 8.02 },
        { upTo: 600, rate: 12.67 },
        { upTo: Infinity, rate: 14.61 },
      ],
    },
    "LT-B: সেচ/অফিস কাজ ছাড়া পাওয়ার": { demandCharge: 42.0, flatRate: 5.25 },
    "LT-C1: শিল্প": { demandCharge: 48.0, flatRate: 10.76 },
    "LT-C2: নির্মাণ": { demandCharge: 120.0, flatRate: 15.15 },
    "LT-D1: শিক্ষা, ধর্মীয় ও দাতব্য প্রতিষ্ঠান এবং হাসপাতাল": {
      demandCharge: 60.0,
      flatRate: 7.55,
    },
    "LT-D2: রাস্তার বাতি ও পানির পাম্প": { demandCharge: 90.0, flatRate: 9.71 },
    "LT-D3: কমার্শিয়াল EV চার্জিং স্টেশন": { demandCharge: 90.0, flat: 9.62 },
    "LT-E: বাণিজ্যিক ও অফিস": { demandCharge: 90.0, flat: 13.01 },
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

const categoriesByVoltage = {
  LT: Object.keys(TARIFFS.LT),
  MT: Object.keys(TARIFFS.MT),
  HT: Object.keys(TARIFFS.HT),
  EHT: Object.keys(TARIFFS.EHT),
};

const voltageSelect = document.getElementById("voltage");
const categorySelect = document.getElementById("category");
const billForm = document.getElementById("billForm");

function populateCategories() {
  const voltage = voltageSelect.value;
  categorySelect.innerHTML = "";
  categoriesByVoltage[voltage].forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

populateCategories();

billForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const voltage = voltageSelect.value;
  const category = categorySelect.value;
  const consumptionInput = document.getElementById("consumption");
  const consumption = parseFloat(consumptionInput.value);

  if (isNaN(consumption) || consumption < 0) {
    alert("অনুগ্রহ করে বৈধ ব্যবহার (kWh) লিখুন।");
    return;
  }

  const tariff = TARIFFS[voltage][category];
  let energyCharge = 0;

  if (category === "LT-A: আবাসিক") {
    let units = consumption;
    if (units > 600) {
      energyCharge += (units - 600) * 14.61;
      units = 600;
    }
    if (units > 400) {
      energyCharge += (units - 400) * 12.67;
      units = 400;
    }
    if (units > 300) {
      energyCharge += (units - 300) * 8.02;
      units = 300;
    }
    if (units > 200) {
      energyCharge += (units - 200) * 7.59;
      units = 200;
    }
    if (units > 75) {
      energyCharge += (units - 75) * 7.2;
      units = 75;
    }
    if (units > 50) {
      energyCharge += (units - 50) * 5.26;
      units = 50;
    }
    energyCharge += units * 4.633;
  } else if (tariff.flatRate !== undefined) {
    energyCharge = consumption * tariff.flatRate;
  } else if (tariff.flat !== undefined) {
    energyCharge = consumption * tariff.flat;
  } else {
    alert("এই শ্রেণির জন্য ট্যারিফ স্ট্রাকচার বাস্তবায়িত হয়নি।");
    return;
  }

  const demandCharge = tariff.demandCharge;
  const subtotal = energyCharge + demandCharge;
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h2><i class="fas fa-file-invoice-dollar"></i> বিল সারসংক্ষেপ</h2>
    <p><strong>শ্রেণি:</strong> ${category}</p>
    <p><strong>ব্যবহার:</strong> ${consumption} kWh</p>
    <p><strong>এনার্জি চার্জ:</strong> ৳${energyCharge.toFixed(2)}</p>
    <p><strong>ডিমান্ড চার্জ:</strong> ৳${demandCharge.toFixed(2)}</p>
    <p><strong>মোট (ভ্যাট ছাড়া):</strong> ৳${subtotal.toFixed(2)}</p>
    <p><strong>ভ্যাট (৫%):</strong> ৳${vat.toFixed(2)}</p>
    <p><strong>মোট বিল:</strong> <strong>৳${total.toFixed(2)}</strong></p>
  `;
  resultDiv.classList.remove("hidden");
  resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

voltageSelect.addEventListener("change", populateCategories);
