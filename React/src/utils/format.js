/**
 * 숫자를 통화 형식으로 변환 (₩1,000,000)
 * @param {number} amount - 통화로 변환할 금액
 * @returns {string} 형식이 지정된 통화 문자열
 */
export function formatCurrency(amount) {
  return `₩${amount.toLocaleString()}`;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param {string|Date} date - 변환할 날짜
 * @returns {string} 형식이 지정된 날짜 문자열
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 변환
 * @param {string|Date} date - 변환할 날짜
 * @returns {string} 형식이 지정된 날짜 문자열
 */
export function formatDateKorean(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 숫자를 백분율로 변환 (예: 0.15 -> 15%)
 * @param {number} value - 백분율로 변환할 값 (0-1 사이)
 * @returns {string} 백분율 문자열
 */
export function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
} 