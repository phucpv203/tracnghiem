// script-mock-test.js - Logic cho trang thi thử (mock_test.html)

window.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const TOTAL_TIME = 45 * 60; // 45 minutes in seconds
  const startIndex = 1;

  // Use subject-scoped keys for mock test so scores are saved per subject
  const subject = window.QUIZ_SUBJECT || localStorage.getItem('quiz_subject') || 'hoahoc';
  const currentKey = `mock_current_${subject}`;
  const selectedKey = `mock_selected_${subject}`;
  const startTimeKey = `mock_start_${subject}`;

  let current = parseInt(localStorage.getItem(currentKey));
  if (isNaN(current)) current = 0;
  let selected = null;
  try { selected = JSON.parse(localStorage.getItem(selectedKey)); } catch (e) { selected = null; }
  let questions = [];
  let timeRemaining = TOTAL_TIME;
  let timerInterval = null;
  let testSubmitted = false;

  const listInner = document.getElementById('question-list-inner');
  const questionEl = document.getElementById('question');
  const answersDiv = document.getElementById('answers');
  const timerEl = document.getElementById('timer');
  const submitBtn = document.getElementById('submit-test');
  const questionCountEl = document.getElementById('question-count');
  const subjectNameEl = document.getElementById('subject-name');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const resultPanel = document.getElementById('result-panel');
  const resultTitle = document.getElementById('result-title');
  const resultScore = document.getElementById('result-score');
  const resultDetails = document.getElementById('result-details');

  // Get subject name from question files
  const subjectMap = {
    'tin': 'Tin học',
    'vatly': 'Vật lý',
    'hoahoc': 'Chính trị LT',
    'chinhtri': 'Chính trị',
    'sinhhoc': 'Chính trị DS',
    'sinhhoc1': 'Sinh học',
    'XSTK': 'XSTK'
  };

  if (subjectNameEl) {
    subjectNameEl.textContent = subjectMap[subject] || subject;
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "e") {
      goNext();
    }
    if (event.key === "ArrowLeft" || event.key === "q") {
      goPrev();
    }
  });

  // Number key selection (1-9)
  document.addEventListener("keydown", function (e) {
    const index = parseInt(e.key) - 1;
    if (isNaN(index)) return;

    const buttons = document.querySelectorAll("#answers button");
    if (index >= 0 && index < buttons.length) {
        buttons[index].click();
    }
  });

  if (!listInner || !questionEl || !answersDiv) {
    console.error('Missing DOM elements. Check mock_test.html structure.');
    return;
  }

  function saveState() {
    try {
      localStorage.setItem(selectedKey, JSON.stringify(selected));
      localStorage.setItem(currentKey, String(current));
    } catch (e) {
      console.warn('Could not save mock test state', e);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function startTimer() {
    // Check if there's a saved start time (in case page was refreshed)
    let startTime = parseInt(localStorage.getItem(startTimeKey));
    if (isNaN(startTime)) {
      startTime = Date.now();
      try { localStorage.setItem(startTimeKey, String(startTime)); } catch (e) {}
    }

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timeRemaining = Math.max(0, TOTAL_TIME - elapsed);

      if (timerEl) {
        timerEl.textContent = formatTime(timeRemaining);
        if (timeRemaining <= 300) { // 5 minutes remaining
          timerEl.style.color = '#d9534f';
        } else {
          timerEl.style.color = '';
        }
      }

      if (timeRemaining === 0) {
        clearInterval(timerInterval);
        submitTest(true); // auto-submit when time runs out
      }
    }, 1000);
  }

  function renderQuestionList() {
    listInner.innerHTML = '';
    const ul = document.createElement('ul');
    ul.style.display = 'flex';
    ul.style.flexWrap = 'wrap';
    ul.style.gap = '4px';
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';

    questions.forEach((q, i) => {
      const li = document.createElement('li');
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

      if (testSubmitted) {
        // Sau submit: hiển thị đúng/sai
        const isCorrect = selected[i] === q.correct;
        const hasAnswer = selected[i] !== undefined && selected[i] !== null;

        if (isCorrect) {
          li.style.background = '#5cb85c';
          li.style.color = '#fff';
          li.title = 'Trả lời đúng';
        } else if (hasAnswer && !isCorrect) {
          li.style.background = '#d9534f';
          li.style.color = '#fff';
          li.title = 'Trả lời sai';
        } else {
          li.style.background = '#f0f0f0';
          li.style.color = '#999';
          li.title = 'Chưa trả lời';
        }
      } else {
        // Trước submit: hiển thị đã/chưa trả lời
        if (selected[i] !== undefined && selected[i] !== null) {
          li.style.background = '#b0d4ff';
          li.style.color = '#fff';
          li.title = 'Đã trả lời';
        } else {
          li.style.background = '#fff';
          li.style.color = '#333';
          li.title = 'Chưa trả lời';
        }
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

    if (questionCountEl) {
      questionCountEl.textContent = (current + 1);
    }

    const q = questions[current] || {};
    questionEl.innerHTML = `<p class="question-title">Câu ${current + startIndex}: ${q.question || ''}</p>`;
    answersDiv.innerHTML = '';

    const opts = q.answers || [];

    // ensure stable shuffled order exists per question
    if (!Array.isArray(q._order) || q._order.length !== opts.length) {
      q._order = shuffleArray(opts.map((_, i) => i));
    }

    // render answers according to shuffled order
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

      if (!testSubmitted) {
        // Mode xem & trả lời
        if (selected[current] === origIdx) {
          btn.style.background = '#b0d4ff';
          btn.style.borderColor = '#7cb3ff';
        }

        btn.onclick = () => {
          selected[current] = origIdx;
          saveState();
          renderQuestion();
        };
      } else {
        // Mode xem kết quả (sau submit)
        btn.disabled = true;
        if (origIdx === q.correct) {
          btn.style.background = '#dff0d8';
          btn.style.borderColor = '#5cb85c';
          btn.style.color = '#3c763d';
        } else if (selected[current] === origIdx && selected[current] !== q.correct) {
          btn.style.background = '#f8d7da';
          btn.style.borderColor = '#f5c6cb';
          btn.style.color = '#721c24';
        } else {
          btn.style.background = '#fff';
        }
      }

      answersDiv.appendChild(btn);
    });

    // Hiển thị giải thích sau khi submit
    if (testSubmitted) {
      const explanationEl = document.createElement('div');
      explanationEl.style.cssText = 'margin-top:16px;padding:12px;background:#f7f7f9;border-left:4px solid #007bff;border-radius:4px;color:#333;';
      
      const userAnswer = selected[current];
      const correctAnswer = q.correct;
      const correctText = opts[correctAnswer] || '';

      if (userAnswer === undefined || userAnswer === null) {
        explanationEl.innerHTML = `<strong style="color:#d9534f;">❌ Bạn chưa trả lời câu này</strong>`;
      } else if (userAnswer === correctAnswer) {
        explanationEl.innerHTML = `<strong style="color:#5cb85c;">✅ Bạn trả lời đúng!</strong>`;
      } else {
        explanationEl.innerHTML = `<strong style="color:#d9534f;">❌ Bạn trả lời sai</strong><br/>
        Đáp án đúng: <strong>${correctText}</strong>`;
      }

      if (q.explanation) {
        explanationEl.innerHTML += `<div style="margin-top:8px;"><strong>Giải thích:</strong> ${q.explanation}</div>`;
      }

      answersDiv.appendChild(explanationEl);
    }

    // Update prev/next button state
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === questions.length - 1;
  }

  function goNext() {
    if (current < questions.length - 1) {
      current++;
      saveState();
      renderQuestion();
    }
  }

  function goPrev() {
    if (current > 0) {
      current--;
      saveState();
      renderQuestion();
    }
  }

  function submitTest(autoSubmit = false) {
    testSubmitted = true;
    if (timerInterval) clearInterval(timerInterval);
    
    // Disable submit button
    if (submitBtn) submitBtn.disabled = true;

    // Calculate score
    let score = 0;
    questions.forEach((q, i) => {
      if (selected[i] !== undefined && selected[i] !== null && selected[i] === q.correct) {
        score++;
      }
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Show result in result panel
    if (resultPanel) {
      resultPanel.style.display = 'block';
      if (resultTitle) resultTitle.textContent = autoSubmit ? 'Hết giờ! Kết quả: ' : 'Kết quả: ';
      if (resultScore) resultScore.innerHTML = `<strong>${score}/${questions.length} câu</strong> (${percentage}%)`;
      if (resultDetails) {
        resultDetails.innerHTML = `
          <div style="margin-top:8px;">
            <p>Bạn có thể xem lại các câu hỏi dưới đây. Câu <span style="color:#5cb85c;font-weight:700;">xanh</span> = đúng, câu <span style="color:#d9534f;font-weight:700;">đỏ</span> = sai.</p>
            <button id="back-home" style="margin-top:8px;padding:8px 16px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Quay về trang chủ</button>
          </div>
        `;
        
        const backBtn = document.getElementById('back-home');
        if (backBtn) {
          backBtn.onclick = () => {
            window.location.href = 'index.html';
          };
        }
      }
    }

    // Clear stored data for this test
    try {
      localStorage.removeItem(currentKey);
      localStorage.removeItem(selectedKey);
      localStorage.removeItem(startTimeKey);
    } catch (e) {}

    // Re-render to show results
    renderQuestion();
    renderQuestionList();
  }

  if (submitBtn) {
    submitBtn.onclick = () => {
      if (confirm('Nộp bài kiểm tra? Sau khi nộp không thể quay lại.')) {
        submitTest();
      }
    };
  }

  // Load questions with subject-aware paths
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
        // Random 80 câu từ toàn bộ câu hỏi
        let allQuestions = data;
        const shuffled = shuffleArray(allQuestions);
        questions = shuffled.slice(0, 80); // Chỉ lấy 80 câu
        
        // generate stable per-question shuffled order
        questions.forEach(q => {
          const len = Array.isArray(q.answers) ? q.answers.length : 0;
          if (!Array.isArray(q._order) || q._order.length !== len) {
            q._order = shuffleArray(Array.from({length: len}, (_,i) => i));
          }
        });
        loaded = true;
        console.log('Loaded', questions.length, 'random questions from', path, '(total available:', allQuestions.length, ')');
        break;
      } catch (err) {
        console.warn('Error loading', path, err);
        continue;
      }
    }

    if (!loaded) {
      questionEl.textContent = 'Lỗi: không thể tải file câu hỏi.';
      console.error('Failed to load any questions file. Candidates:', candidates);
      return;
    }

    // Try to restore saved selected/current for this test
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

    // Bind prev/next button event listeners
    if (prevBtn) {
      prevBtn.onclick = goPrev;
    }
    if (nextBtn) {
      nextBtn.onclick = goNext;
    }

    renderQuestion();
    startTimer();
  }

  // trigger loading
  loadQuestions().catch(err => {
    console.error('Unexpected error in loadQuestions', err);
    questionEl.textContent = 'Lỗi khi tải câu hỏi.';
  });
});
