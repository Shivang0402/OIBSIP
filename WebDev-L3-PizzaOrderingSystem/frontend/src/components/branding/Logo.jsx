import logoFull from '../../assests/images/Logo.png';

function Logo({ variant = 'full' }) {
  return (
    <div className={`logo logo--${variant}`}>
      <img
        src={logoFull}
        alt="PizzaNova — Crafted With Every Slice"
        className="logo__image"
      />
    </div>
  );
}

export default Logo;
