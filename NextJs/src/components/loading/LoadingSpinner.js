import React from 'react';
import style from './LoadingSpinner.module.css';

const LoadingSpinner = ({ 
    size = 'medium',  // 'small' | 'medium' | 'large'
    color = 'primary' // 'primary' | 'white' | 'gray'
}) => {
    const sizeClass = style[size];
    const colorClass = style[color];

    return (
        <div className={`${style.spinner} ${sizeClass} ${colorClass}`}>
            <div className={style.spinnerCircle} />
        </div>
    );
};

export default LoadingSpinner;