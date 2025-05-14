import Gleap from "gleap"; // See https://gleap.io/docs/javascript/ and https://app.gleap.io/projects/62697858a4f6850036ae2e6a/widget

export function initializeGleap(url, newTab, gleapSdkToken) {
    if (typeof window !== 'undefined') {
        
        if (!gleapSdkToken) {
            console.warn('initializeGleap: Gleap SDK token is not set. Gleap will not be initialized.');
            return;
        }
        if (!url) {
            url = window.location.href;
        }
        if (!newTab) {
            newTab = false;
        }
        if (gleapSdkToken, url, newTab) {
            Gleap.initialize(gleapSdkToken);
            // Override default URL handler to sanitize open-url messages from Gleap (NEAR-247)
            Gleap.setUrlHandler((url, newTab) => {
                try {
                    const parsed = new URL(url, window.location.href);
                    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                        console.warn('Blocked invalid Gleap navigation to unsafe protocol:', parsed.protocol);
                        return;
                    }
                    if (newTab) {
                        window.open(parsed.href, '_blank')?.focus();
                    } else {
                        window.location.href = parsed.href;
                    }
                } catch (e) {
                    console.warn('Blocked invalid Gleap URL:', url, e);
                }
            });
        }
    }
}