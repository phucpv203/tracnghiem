// script-index.js - Logic cho trang chọn môn (index.html)

function selectReview(subject) {
  try {
    localStorage.setItem('quiz_subject', subject);
  } catch (e) {
    console.warn('Could not save quiz_subject', e);
  }
  // Kiểm tra đăng nhập; nếu chưa có hoặc hết hạn thì chuyển tới trang đăng nhập kèm return URL
  try {
    if (!(window.Auth && Auth.isAuthenticated())) {
      const ret = `review.html?subject=${subject}`;
      window.location.href = `login.html?r=${encodeURIComponent(ret)}`;
      return;
    }
  } catch(e) {
    const ret = `review.html?subject=${subject}`;
    window.location.href = `login.html?r=${encodeURIComponent(ret)}`;
    return;
  }
  window.location.href = `review.html?subject=${subject}`;
}

function selectMock(subject) {
  try {
    localStorage.setItem('quiz_subject', subject);
  } catch (e) {
    console.warn('Could not save quiz_subject', e);
  }
  try {
    if (!(window.Auth && Auth.isAuthenticated())) {
      const ret = `mock_test.html?subject=${subject}`;
      window.location.href = `login.html?r=${encodeURIComponent(ret)}`;
      return;
    }
  } catch(e) {
    const ret = `mock_test.html?subject=${subject}`;
    window.location.href = `login.html?r=${encodeURIComponent(ret)}`;
    return;
  }
  window.location.href = `mock_test.html?subject=${subject}`;
}
