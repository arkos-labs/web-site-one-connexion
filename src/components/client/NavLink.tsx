import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  label: string;
  isScrolled: boolean;
}

const NavLink = ({ to, label, isScrolled }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative text-sm font-medium transition-colors duration-300 group ${isActive
          ? "text-[#FFCC00]"
          : isScrolled
            ? "text-[#002147] hover:text-[#FFCC00]"
            : "text-white hover:text-[#FFCC00]"
        }`}
    >
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-[#FFCC00] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
          }`}
      />
    </Link>
  );
};

export default NavLink;
