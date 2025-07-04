import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import { useEffect, useState } from "react";
import { rpad2D } from "shared/utils/Utils";
import { Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper as ReactSwiper, SwiperSlide } from "swiper/react";
import style from "./SwiperWrapper.module.css";
/*
  예시)
    <Swiper
      cols={2}
      data={[{ id: "a" }, { id: "b" }, { id: "c" }]}
      initialData={{ id: null }}
      Cell={({ data }) => <P>{data.id}</P>}
    />
    
    cols : number = 한 페이지 구성될 요소
    data : array = 입력될 데이터들
    initialData : object = 사전 입력 데이터,
    Cell : component : 입력된 데이터 1개로 그려질 컴포넌트
*/
function Swiper({ cols, data, Cell, initialData, autoPlay, navigation, gap }) {
  const [slides, setSlides] = useState();
  useEffect(() => {
    let slidesRpad = rpad2D(data, cols, initialData);
    setSlides(slidesRpad);
  }, []);

  return (
    <ReactSwiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={
        autoPlay
          ? {
              delay: autoPlay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false
      }
      navigation={navigation ? navigation : false}
      modules={[Autoplay, Navigation]}
      className={"itemSwiper"}
    >
      {slides
        ? slides.map((slide, sindex) => (
            <SwiperSlide key={`slide_${sindex}`}>
              <div className={style.wrap}>
                <HorizontalFlex gap={gap}>
                  {slide
                    ? slide.map((column, index) => (
                        <FlexChild key={index}>
                          {Cell && data && (
                            <Cell
                              key={`${sindex}_column_${index}`}
                              data={column}
                            />
                          )}
                        </FlexChild>
                      ))
                    : null}
                </HorizontalFlex>
              </div>
            </SwiperSlide>
          ))
        : null}
    </ReactSwiper>
  );
}

export default Swiper;
