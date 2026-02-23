export const sendTelegramMessage = async (text) => {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("Telegram non configuré (VITE_TELEGRAM_BOT_TOKEN ou VITE_TELEGRAM_CHAT_ID manquant).");
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "HTML",
            }),
        });

        if (!response.ok) {
            console.error("Erreur lors de l'envoi du message Telegram", await response.text());
        }
    } catch (error) {
        console.error("Erreur Telegram:", error);
    }
};
