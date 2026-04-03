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
        sm: "w-32 md:w-40 lg:w-48",
        md: "w-44 md:w-56 lg:w-64",
        lg: "w-56 md:w-72 lg:w-80"
    }[size];

    return (
        <Link to="/" className={cn("flex flex-col group", className)}>
            <img
                src={isLightLogo ? "/logos/one-connexion-light.png" : "/logos/one-connexion-dark.png"}
                alt="One Connexion"
                className={cn(
                    "aspect-[4/1] object-cover transition-transform group-hover:scale-105",
                    widthClass
                )}
            />
        </Link>
    );
};

export default Logo;


