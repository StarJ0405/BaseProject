import Masonry from "react-masonry-css";
import style from "./MasonryGrid.module.css";

function MasonryGrid(props) {
    const defaultBreakpoints = {
        default: 6,
        1440: 5,
        1024: 4,
        768: 2,
    };    
    const breakpoints = props.breakpoints || defaultBreakpoints;

    return (
        <Masonry 
            breakpointCols={breakpoints}
            className={style.masonryGrid}
            columnClassName={style.masonryColumn}
            style={{ 
                gap: props.gap, 
                width: props.width ? props.width : undefined
            }}
        >
            {props.children}
        </Masonry>
    );
}

export default MasonryGrid;
