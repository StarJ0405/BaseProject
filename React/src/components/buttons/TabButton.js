import FlexChild from 'components/flex/FlexChild';
import style from './TabButton.module.css';
import React from 'react';
import P from 'components/P/P';
import Div from 'components/div/Div';

const TabButton = React.memo(({ isActive, onClick, children }) => {
    return (
        <FlexChild
            justifyContent="center"
            width={"fit-content"}
        >
            <div
                onClick={onClick}
                className={`${style.tabBtn} ${isActive ? style.active : style.inactive}`}>
                <P size={18} weight={700}>{children}</P>
            </div>
        </FlexChild>
    );
});

export default TabButton;