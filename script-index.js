// script-index.js - Logic cho trang chọn môn (index.html)

function selectReview(subject) {
  try {
    localStorage.setItem('quiz_subject', subject);
  } catch (e) {
    console.warn('Could not save quiz_subject', e);
  }
  window.location.href = `review.html?subject=${subject}`;
}

function selectMock(subject) {
  try {
    localStorage.setItem('quiz_subject', subject);
  } catch (e) {
    console.warn('Could not save quiz_subject', e);
  }
  window.location.href = `mock_test.html?subject=${subject}`;
}
