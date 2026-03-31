import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
    variant?: "default" | "light" | "dark" | "sidebar";
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export const Logo = ({
    variant = "default",
    size = "md",
    showText = true,
    className
}: LogoProps) => {
    const isLightLogo = variant === 'light' || variant === 'sidebar';

    // Size mapping for the image width
    const widthClass = {
        sm: "w-24 md:w-32 lg:w-36",
        md: "w-32 md:w-40 lg:w-44",
        lg: "w-40 md:w-48 lg:w-56"
    }[size];

    return (
        <Link to="/" className={cn("flex flex-col group", className)}>
            <img
                src={isLightLogo ? "/logos/one-connexion-light.png" : "/logos/ONECONNEXION-04.png"}
                alt="One Connexion"
                className={cn(
                    "h-auto object-contain transition-transform group-hover:scale-105",
                    widthClass
                )}
            />
        </Link>
    );
};

export default Logo;


