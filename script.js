// Sự kiện cho nút Xóa điểm
window.addEventListener('DOMContentLoaded', () => {
  // start index for question numbering (câu bắt đầu từ 221)
  const startIndex = 1;

  // use subject-scoped keys for review page so positions are saved per subject
  const subject = window.QUIZ_SUBJECT || localStorage.getItem('quiz_subject') || 'hoahoc';
  const currentKey = `review_current_${subject}`;
  const selectedKey = `review_selected_${subject}`;

  let current = parseInt(localStorage.getItem(currentKey));
  if (isNaN(current)) current = 0;
  let selected = null;
  try { selected = JSON.parse(localStorage.getItem(selectedKey)); } catch (e) { selected = null; }
  let questions = [];

  const listInner = document.getElementById('question-list-inner');
  const questionEl = document.getElementById('question');
  const answersDiv = document.getElementById('answers');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const resultBox = document.getElementById('result');
  const resetBtn = document.getElementById('reset-score');
  
 
  document.addEventListener("keydown", function (event) {

    if (event.key === "ArrowRight") {
        nextBtn.click();
    };
    if (event.key === "ArrowLeft") {
        prevBtn.click();
    };
  });

  document.addEventListener("keydown", function (e) {
    console.log("Key:", e.key);

    const index = parseInt(e.key) - 1;
    if (isNaN(index)) return;

    const buttons = document.querySelectorAll("#answers button");
    if (index >= 0 && index < buttons.length) {
        buttons[index].click();
    }
  });



  if (!listInner || !questionEl || !answersDiv) {
    console.error('Missing DOM elements. Check index.html structure.');
    return;
  }

  function saveState() {
    try {
      localStorage.setItem(selectedKey, JSON.stringify(selected));
      localStorage.setItem(currentKey, String(current));
    } catch (e) {
      console.warn('Could not save review state', e);
    }
  }

  function renderQuestionList() {
    listInner.innerHTML = '';
    const ul = document.createElement('ul');
    ul.style.display = 'flex';
    ul.style.flexWrap = 'nowrap';
    ul.style.gap = '10px';
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    questions.forEach((q, i) => {
      const li = document.createElement('li');
      // show numbering starting from startIndex
      li.textContent = (i + startIndex);
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.style.width = '32px';
      li.style.height = '32px';
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'center';
      li.style.borderRadius = '50%';
      li.style.cursor = 'pointer';
      li.style.border = '1px solid #ccc';
      li.style.flex = '0 0 auto';
      li.style.fontWeight = '600';

      if (selected[i] !== undefined && selected[i] !== null) {
        if (questions[i] && selected[i] === questions[i].correct) {
          li.style.background = '#2ecc71';
          li.style.color = '#fff';
          li.title = 'Đã trả lời đúng';
        } else {
          li.style.background = '#e74c3c';
          li.style.color = '#fff';
          li.title = 'Đã trả lời sai';
        }
      } else {
        li.style.background = '#fff';
        li.style.color = '#333';
        li.title = 'Chưa trả lời';
      }

      if (i === current) {
        li.style.outline = '3px solid #ffe600';
        li.setAttribute('aria-current', 'true');
      } else {
        li.style.outline = 'none';
        li.removeAttribute('aria-current');
      }

      const activate = () => {
        current = i;
        saveState();
        renderQuestion();
        showResult();
      };

      li.onclick = activate;
      li.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      };
      ul.appendChild(li);
    });
    listInner.appendChild(ul);

    // Auto-scroll the current item into view (centered)
    const currentLi = ul.children[current];
    if (currentLi) {
      try {
        currentLi.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {
        // Fallback for older browsers: adjust scrollLeft to center
        const listRect = listInner.getBoundingClientRect();
        const btnRect = currentLi.getBoundingClientRect();
        const offset = (btnRect.left + btnRect.right) / 2 - (listRect.left + listRect.right) / 2;
        listInner.scrollLeft += offset;
      }
    }
  }

  function ensureExplainEl() {
    let exEl = document.getElementById('explain');
    if (!exEl) {
      exEl = document.createElement('div');
      exEl.id = 'explain';
      exEl.style.marginTop = '12px';
      exEl.style.padding = '12px';
      exEl.style.background = '#f7f7f9';
      exEl.style.borderRadius = '6px';
      exEl.style.border = '1px solid #eee';
      exEl.style.color = '#333';
      answersDiv.parentNode.insertBefore(exEl, answersDiv.nextSibling);
    }
    return exEl;
  }

  // Fisher-Yates shuffle that returns a new array
  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderQuestion() {
    renderQuestionList();
    if (!questions.length) return;
    const q = questions[current] || {};
    // display question number using startIndex offset
    questionEl.textContent = `Câu ${current + startIndex}: ${q.question || ''}`;
    answersDiv.innerHTML = '';

    // remove old explain (will be recreated by showResult)
    const existingExplain = document.getElementById('explain');
    if (existingExplain) existingExplain.remove();

    const opts = q.answers || [];

    // ensure stable shuffled order exists per question
    if (!Array.isArray(q._order) || q._order.length !== opts.length) {
      q._order = shuffleArray(opts.map((_, i) => i));
    }

    // render answers according to shuffled order, but preserve original indices for selection and correctness
    q._order.forEach((origIdx, displayIdx) => {
      const ansText = opts[origIdx];
      const btn = document.createElement('button');
      btn.textContent = ansText;
      btn.className = (selected[current] === origIdx) ? 'selected' : '';
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '8px 0';
      btn.style.padding = '10px';
      btn.style.borderRadius = '6px';
      btn.style.border = '1px solid #ddd';

      if (selected[current] !== undefined && selected[current] !== null) {
        // already answered -> show colors and disable
        btn.disabled = true;
        const chosen = selected[current];
        if (origIdx === q.correct) {
          btn.style.background = '#dff0d8';
          btn.style.borderColor = '#b2d8a7';
        } else if (origIdx === chosen && chosen !== q.correct) {
          btn.style.background = '#f8d7da';
          btn.style.borderColor = '#e39aa2';
        } else {
          btn.style.background = '#fff';
        }
      } else {
        // allow selecting
        btn.onclick = () => {
          // save the original index as the user's choice so correctness mapping stays consistent
          selected[current] = origIdx;
          saveState();
          renderQuestion(); // re-render to disable buttons & color
          showResult();     // show explanation immediately
          // scroll explanation into view
          const ex = document.getElementById('explain');
          if (ex) ex.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
      }
      answersDiv.appendChild(btn);
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === questions.length - 1;
  }

  function showResult() {
    // tổng điểm
    let score = 0;
    questions.forEach((q, i) => {
      if (selected[i] !== undefined && selected[i] !== null && selected[i] === q.correct) score++;
    });
    resultBox.textContent = `Đã đúng ${score}/${questions.length} câu`;

    if (!questions.length) return;
    const q = questions[current] || {};
    const exEl = ensureExplainEl();
    const sel = selected[current];
    if (sel === undefined || sel === null) {
      exEl.innerHTML = '';
      return;
    }

    const correctText = (q.answers && q.answers[q.correct]) ? q.answers[q.correct] : '';

    // đảm bảo explanation luôn là chuỗi (tránh undefined)
    const explanation = (typeof q.explanation === 'string' && q.explanation.trim() !== '') ? q.explanation : '';

    // hiển thị kết quả + giải thích (hỗ trợ HTML trong q.explanation)
    if (sel === q.correct) {
      exEl.innerHTML = `<div style="font-weight:600;color:#2a7a41">Bạn trả lời đúng ✅</div>` +
                       (explanation ? `<div style="margin-top:8px">${explanation}</div>` : '');
    } else {
      exEl.innerHTML = `<div style="font-weight:600;color:#8a2a2a">Bạn trả lời sai ❌. Đáp án đúng: <strong>${correctText}</strong></div>` +
                       (explanation ? `<div style="margin-top:8px">${explanation}</div>` : '');
    }
    exEl.style.display = 'block';
  }

  // navigation handlers
  prevBtn.onclick = () => {
    if (current > 0) current--;
    saveState();
    renderQuestion();
    showResult();
  };
  nextBtn.onclick = () => {
    if (current < questions.length - 1) current++;
    saveState();
    renderQuestion();
    showResult();
  };

  // reset
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (!confirm('Xóa toàn bộ điểm?')) return;
      selected = Array(questions.length).fill(undefined);
      current = 0;
      try { localStorage.removeItem(selectedKey); localStorage.removeItem(currentKey); } catch (e) {}
      renderQuestion();
      showResult();
    };
  }

  // --- changed code: load questions with subject-aware paths and robust JSON parsing ---
  async function loadQuestions() {
    const params = new URLSearchParams(location.search);
    const subParam = params.get('subject');
    const storedSub = localStorage.getItem('quiz_subject');
    const subject = subParam || storedSub || window.QUIZ_SUBJECT || null;

    if (subject) {
      try { localStorage.setItem('quiz_subject', subject); } catch (e) {}
    }

    // candidate paths to try (order matters)
    const candidates = [];
    if (window.QUESTIONS_FILE) candidates.push(window.QUESTIONS_FILE);
    if (subject) {
      candidates.push(`question/questions_${subject}.json`);
      candidates.push(`questions_${subject}.json`);
    }
    candidates.push('questions.json'); // final fallback

    let loaded = false;
    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) {
          console.warn('Fetch not ok for', path, res.status);
          continue;
        }
        // read text first to handle BOM and malformed JSON gracefully
        let txt = await res.text();
        if (!txt) {
          console.warn('Empty file', path);
          continue;
        }
        // remove BOM if present
        if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
        let data;
        try {
          data = JSON.parse(txt);
        } catch (e) {
          console.error('JSON parse error for', path, e);
          continue;
        }
        if (!Array.isArray(data)) {
          console.warn('JSON is not an array in', path);
          continue;
        }
        questions = data;
        // generate stable per-question shuffled order to randomize answer positions
        questions.forEach(q => {
          const len = Array.isArray(q.answers) ? q.answers.length : 0;
          if (!Array.isArray(q._order) || q._order.length !== len) {
            q._order = shuffleArray(Array.from({length: len}, (_,i) => i));
          }
        });
        loaded = true;
        console.log('Loaded questions from', path, 'count=', questions.length);
        break;
      } catch (err) {
        console.warn('Error loading', path, err);
        continue;
      }
    }

    if (!loaded) {
      questionEl.textContent = 'Lỗi: không thể tải file câu hỏi. Kiểm tra console và server.';
      console.error('Failed to load any questions file. Candidates:', candidates);
      return;
    }

    // Try to restore saved selected/current for this subject (may have been set earlier)
    try {
      const savedSelected = JSON.parse(localStorage.getItem(selectedKey));
      if (Array.isArray(savedSelected) && savedSelected.length === questions.length) {
        selected = savedSelected;
      }
    } catch (e) { /* ignore parse errors */ }

    const savedCurrent = parseInt(localStorage.getItem(currentKey));
    if (!isNaN(savedCurrent) && savedCurrent >= 0 && savedCurrent < questions.length) {
      current = savedCurrent;
    }

    // normalize to defaults if still invalid
    if (!selected || !Array.isArray(selected) || selected.length !== questions.length) {
      selected = Array(questions.length).fill(undefined);
    }
    if (isNaN(current) || current < 0 || current >= questions.length) current = 0;

    renderQuestion();
    showResult();
  }

  // trigger loading
  loadQuestions().catch(err => {
    console.error('Unexpected error in loadQuestions', err);
    questionEl.textContent = 'Lỗi khi tải câu hỏi.';
  });
});
