(function() {
  const html = document.documentElement;
  const key = 'theme';
  
  // 1. 저장된 테마 적용 (없으면 시스템 기본값)
  const theme = localStorage.getItem(key);
  if (theme) html.setAttribute('data-theme', theme);

  // 2. 전역 함수 대신 이벤트 위임으로 처리 (UI에서 사용)
  window.toggleTheme = () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    // 만약 다시 시스템 설정을 따르게 하고 싶다면 'auto' 대신 속성 제거
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(key, newTheme);
  };
})();
