import Logo from './Logo';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-ring-wrapper">
        <div className="loader-ring"></div>
        <div className="loader-ring loader-ring-inner"></div>
        <Logo className="loader-logo" size={32} />
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
