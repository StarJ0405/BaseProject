import lottie from "lottie-web";
import { useEffect, useRef } from "react";
import loadingAnimation from "resources/images/loading.json";

const LoadingSpinner2 = ({ size = 100, width, height, hidden }) => {
  const containerRef = useRef(null);
  const w = width || size;
  const h = height || size;
  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loadingAnimation,
    });

    return () => anim.destroy();
  }, []);

  return (
    <div hidden={hidden} ref={containerRef} style={{ width: w, height: h }} />
  );
};

export default LoadingSpinner2;
