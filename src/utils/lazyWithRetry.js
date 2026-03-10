import { lazy } from "react";

/**
 * A wrapper for React.lazy that retries the import if it fails.
 * Useful for handling ChunkLoadErrors in production.
 */
export const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.localStorage.getItem("page-has-been-force-refreshed") || "false"
        );

        try {
            const component = await componentImport();
            window.localStorage.setItem("page-has-been-force-refreshed", "false");
            return component;
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // First failure: set flag and reload
                window.localStorage.setItem("page-has-been-force-refreshed", "true");
                return window.location.reload();
            }

            // If it fails again after reload, throw the error
            throw error;
        }
    });
