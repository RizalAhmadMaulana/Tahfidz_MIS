const IconButton = ({ icon: Icon, colorClass, onClick, href, title }) => {
  const baseClass = `w-[34px] h-[34px] rounded-[4px] border-none text-white flex items-center justify-center text-[1.1rem] transition-all hover:opacity-85 hover:scale-105 cursor-pointer ${colorClass}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={baseClass} title={title}>
        <Icon />
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClass} title={title}>
      <Icon />
    </button>
  );
};

export default IconButton;