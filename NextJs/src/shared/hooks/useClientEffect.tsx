import { DependencyList, EffectCallback, useEffect, useRef } from "react";

const useClientEffect = (
  callback: EffectCallback,
  dependencies: DependencyList,
  init: boolean = false
) => {
  const isInitialMount = useRef(init); // 컴포넌트가 처음 마운트되었는지 추적

  useEffect(() => {
    // isInitialMount.current가 true이면 (첫 렌더링 시)
    // 플래그를 false로 바꾸고 콜백을 실행하지 않음
    if (!isInitialMount.current) {
      isInitialMount.current = true;
    } else {
      // isInitialMount.current가 false이면 (두 번째 렌더링부터)
      // 콜백 함수를 실행
      return callback(); // useEffect 콜백은 클린업 함수를 반환할 수 있음
    }
  }, dependencies); // 의존성 배열이 변경될 때마다 실행
};

export default useClientEffect;
