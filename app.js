// 가격 데이터
const prices = {
    flight: 400000,
    pickup: 66000,
    food: 220000,
    accommodation: 0,
    activities: {
        jetski: 103000,
        parasailing: 118000,
        diving: 44000,
        blackpearl: 85000,
        bojamussa: 102000,
        malumparty: 29000,
    },
    massage: {
        kabayan: 30000,
        boraspa: 70000,
        lunaspa: 45000,
    },
};

const itemPrices = {
    // 액티비티
    jetski: 103000,
    parasailing: 118000,
    diving: 44000,
    blackpearl: 85000,
    bojamussa: 102000,
    malumparty: 29000,
    // 마사지
    kabayan: 30000,
    boraspa: 70000,
    lunaspa: 45000,
};

// 상태 관리
let state = {
    currentStep: 1,
    selectedSteps: {
        step1: false,
        step2: false,
        step3: false,
    },
    accommodation: 0,
    accommodationA: 0,
    accommodationB: 0,
    accommodationType: "single",
    counts: {
        jetski: 0,
        parasailing: 0,
        diving: 0,
        blackpearl: 0,
        bojamussa: 0,
        malumparty: 0,
        kabayan: 0,
        boraspa: 0,
        lunaspa: 0,
    },
};

// [수정] 고정 항목 선택 함수 (event 인자 명시적 추가)
function selectFixed(step, price, event) {
    // event가 없을 경우를 대비해 window.event 확인
    const evt = event || window.event;
    const card = evt.currentTarget || evt.target.closest(".option-card");

    // UI 업데이트: 해당 단계의 카드들 중 선택된 것 표시
    const section = document.getElementById("step" + step);
    section
        .querySelectorAll(".option-card")
        .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    // 상태 업데이트 및 버튼 활성화
    state.selectedSteps["step" + step] = true;
    const nextBtn = document.getElementById("next-" + step);
    if (nextBtn) nextBtn.disabled = false;

    updateTotal();
}

function prevStep(step) {
    document
        .querySelectorAll(".step-section")
        .forEach((s) => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
    state.currentStep = step;
    document.getElementById("progress").textContent = step + "/6 단계";
    window.scrollTo(0, 0);
}

function nextStep(step) {
    document
        .querySelectorAll(".step-section")
        .forEach((s) => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
    state.currentStep = step;
    document.getElementById("progress").textContent = step + "/6 단계";
    window.scrollTo(0, 0);
}

function selectAccommodation(id, price, event) {
    const evt = event || window.event;
    const card = evt.currentTarget || evt.target.closest(".option-card");
    const container = card.parentElement;

    container
        .querySelectorAll(".option-card")
        .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    if (state.accommodationType === "single") {
        state.accommodation = price;
        document.getElementById("next-4").disabled = false;
    } else {
        if (id.includes("split-a")) {
            state.accommodationA = price;
        } else if (id.includes("split-b")) {
            state.accommodationB = price;
        }
        state.accommodation = state.accommodationA + state.accommodationB;

        if (state.accommodationA > 0 && state.accommodationB > 0) {
            document.getElementById("next-4").disabled = false;
        }
    }
    updateTotal();
}

function selectAccommodationType(type) {
    state.accommodationType = type;
    state.accommodation = 0;
    state.accommodationA = 0;
    state.accommodationB = 0;

    document
        .querySelectorAll(".radio-option")
        .forEach((opt) => opt.classList.remove("selected"));

    // event 처리 안전하게
    if (window.event) {
        window.event.target.classList.add("selected");
    }

    if (type === "single") {
        document.getElementById("accommodation-single").style.display = "block";
        document.getElementById("accommodation-split").style.display = "none";
    } else {
        document.getElementById("accommodation-single").style.display = "none";
        document.getElementById("accommodation-split").style.display = "block";
    }

    document
        .querySelectorAll("#step4 .option-card")
        .forEach((card) => card.classList.remove("selected"));
    document.getElementById("next-4").disabled = true;

    updateTotal();
}

function changeCount(type, delta) {
    const countElement = document.getElementById(`count-${type}`);
    if (!countElement) return;

    let currentCount = parseInt(countElement.innerText);
    currentCount = Math.max(0, currentCount + delta);
    countElement.innerText = currentCount;

    // 수량이 변하면 버튼 활성화 여부와 총액을 모두 업데이트
    updateStepButtonStatus(5); // 액티비티 버튼 체크
    updateStepButtonStatus(6); // 마사지 버튼 체크
    updateTotalPrice();
}

function updateStepButtonStatus(step) {
    const stepDiv = document.getElementById(`step${step}`);
    if (!stepDiv) return;

    const counts = stepDiv.querySelectorAll(".counter-value");
    let totalSelected = 0;
    counts.forEach((el) => {
        totalSelected += parseInt(el.innerText);
    });

    const nextBtn = document.getElementById(`next-${step}`);
    if (nextBtn) {
        // 하나라도 선택되면 활성화
        nextBtn.disabled = totalSelected === 0;
        nextBtn.style.background = totalSelected > 0 ? "#667eea" : "#adb5bd";
    }
}

function updateTotalPrice() {
    // 1~4단계 고정값 합산 (기존 로직 유지)
    let total = totalFixedPrices;

    // 5~6단계 카운트 아이템 합산
    for (const item in itemPrices) {
        const countElement = document.getElementById(`count-${item}`);
        if (countElement) {
            const count = parseInt(countElement.innerText);
            total += count * itemPrices[item];
        }
    }

    // 화면에 표시
    const totalDisplay = document.getElementById("total-price");
    if (totalDisplay) {
        totalDisplay.innerText = total.toLocaleString() + "원";
    }
}

// 액티비티 선택 여부에 따라 버튼 활성화
function updateActivityNextButton() {
    const step5 = document.getElementById("step5");
    if (!step5) return;

    // step5 안에 있는 모든 counter-value의 값을 더함
    const counts = step5.querySelectorAll(".counter-value");
    let totalSelected = 0;
    counts.forEach((el) => {
        totalSelected += parseInt(el.innerText);
    });

    const nextBtn = document.getElementById("next-5");
    if (nextBtn) {
        // 하나라도 선택되면 활성화 (0보다 크면 활성)
        if (totalSelected > 0) {
            nextBtn.disabled = false;
            nextBtn.style.background = "#667eea"; // 활성화 색상
        } else {
            nextBtn.disabled = true;
            nextBtn.style.background = "#adb5bd"; // 비활성화 색상
        }
    }
}

function updateTotal() {
    let total = 0;
    if (state.selectedSteps.step1) total += prices.flight;
    if (state.selectedSteps.step2) total += prices.pickup;
    if (state.selectedSteps.step3) total += prices.food;

    total += state.accommodation;

    Object.keys(prices.activities).forEach((key) => {
        total += prices.activities[key] * (state.counts[key] || 0);
    });

    Object.keys(prices.massage).forEach((key) => {
        total += prices.massage[key] * (state.counts[key] || 0);
    });

    const totalEl = document.getElementById("total-price");
    if (totalEl) totalEl.textContent = total.toLocaleString() + "원";

    const budgetStatus = document.getElementById("budget-status");
    if (budgetStatus) {
        if (total < 1400000) {
            budgetStatus.className = "budget-status good";
            budgetStatus.textContent = "예산 여유 있음 (기준: 1,500,000원)";
        } else if (total <= 1500000) {
            budgetStatus.className = "budget-status warning";
            budgetStatus.textContent = "적정 예산 (기준: 1,500,000원)";
        } else {
            budgetStatus.className = "budget-status over";
            budgetStatus.textContent = "⚠️ 예산 초과 (기준: 1,500,000원)";
        }
    }
}

function showSummary() {
    alert(
        "견적이 완료되었습니다!\n\n총 예상 비용: " +
            document.getElementById("total-price").textContent,
    );
}

updateTotal();
