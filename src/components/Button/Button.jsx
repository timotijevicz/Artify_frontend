import React from 'react';
import './Button.css'; 

function Button({ text, className, onClick, type = "button" , icon,disabled }) {
  return (
    <button className={className} onClick={onClick}  type={type}  disabled={disabled}  >
         {icon && <i className={icon}> </i>}
      {text}
     
    </button>
  );
}

export default Button;
