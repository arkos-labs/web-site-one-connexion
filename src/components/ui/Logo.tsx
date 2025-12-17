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
    // Determine if the logo needs to be light (for dark backgrounds)
    // variant 'light' -> text-white (so logo should be light)
    // variant 'sidebar' -> text-sidebar-foreground (usually light on dark sidebar)
    const isLightLogo = variant === 'light' || variant === 'sidebar';

    // Size mapping for the image width
    const widthClass = {
        sm: "w-24",
        md: "w-32",
        lg: "w-56"
    }[size];

    return (
        <Link to="/" className={cn("flex items-center gap-2 group", className)}>
            <img
                src="/logo-one-connexion.png"
                alt="One Connexion Express"
                className={cn(
                    "h-auto object-contain transition-transform group-hover:scale-105",
                    widthClass,
                    "mix-blend-multiply"
                )}
            />
        </Link>
    );
};

export default Logo;
