const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className
}) => {
  const baseClasses = `
    font-bold py-2 px-4 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-primary-default hover:bg-primary-dark text-white focus:ring-green-500
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
