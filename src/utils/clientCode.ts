export const generateInternalCode = () => {
    // Generate a random 4-digit number
    const random = Math.floor(Math.random() * 10000);
    return `CL-${random.toString().padStart(4, '0')}`;
};
