import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface AuthToggleProps {
    activeMode: "login" | "register";
}

const AuthToggle = ({ activeMode }: AuthToggleProps) => {
    const navigate = useNavigate();

    const handleToggle = (mode: "login" | "register") => {
        if (mode === activeMode) return;

        if (mode === "login") {
            navigate("/login");
        } else {
            navigate("/register");
        }
    };

    return (
        <div className="flex justify-center mb-6">
            <div className="relative bg-gray-100 rounded-full p-1 shadow-md border border-gray-200">
                <div className="flex items-center gap-1 relative">
                    {/* Sliding Background Pill with 3D effect */}
                    <motion.div
                        className="absolute top-1 h-[calc(100%-8px)] bg-[#FFCC00] rounded-full shadow-lg"
                        initial={false}
                        animate={{
                            left: activeMode === "login" ? "4px" : "50%",
                            width: activeMode === "login" ? "calc(50% - 6px)" : "calc(50% - 6px)",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                        }}
                    />

                    {/* Login Button */}
                    <motion.button
                        onClick={() => handleToggle("login")}
                        className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap min-w-[140px] ${activeMode === "login"
                                ? "text-[#002147]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        animate={{
                            scale: activeMode === "login" ? 1.05 : 1,
                        }}
                        transition={{
                            scale: { duration: 0.3 },
                        }}
                    >
                        Connexion
                    </motion.button>

                    {/* Register Button */}
                    <motion.button
                        onClick={() => handleToggle("register")}
                        className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap min-w-[160px] ${activeMode === "register"
                                ? "text-[#002147]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        animate={{
                            scale: activeMode === "register" ? 1.05 : 1,
                        }}
                        transition={{
                            scale: { duration: 0.3 },
                        }}
                    >
                        Créer un compte
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AuthToggle;
