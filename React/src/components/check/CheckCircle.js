import React from 'react';
import style from './CheckCircle.module.css';

const CheckCircle = ({ isActive, onClick }) => {
  return (
    <div 
      className={`${style.checkCircle} ${isActive ? style.active : ''}`}
      onClick={onClick}
    >
      {isActive && <div className={style.innerCircle} />}
    </div>
  );
}; export default CheckCircle