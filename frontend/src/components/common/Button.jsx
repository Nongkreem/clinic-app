const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, className }) => {
  let baseClasses = "font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  let variantClasses = "";

  switch (variant) {
    case 'primary':
      variantClasses = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
      break;
    case 'secondary':
      variantClasses = "bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-500";
      break;
    case 'danger':
      variantClasses = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
      break;
    case 'success':
      variantClasses = "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500";
      break;
    default:
      variantClasses = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;