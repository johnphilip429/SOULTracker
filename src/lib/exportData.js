// Keys must match the `name` option passed to Zustand's persist() in each store file.
const STORE_KEYS = {
    user:      'soultrack-user-storage',
    scheduler: 'soultrack-scheduler-storage',
    habits:    'soultrack-habit-storage',
    logs:      'soultrack-log-storage',
    goals:     'soultrack-goal-storage',
};

/**
 * Reads all five Zustand persist keys from localStorage, bundles them into a
 * single JSON payload, and triggers a download (or share sheet on mobile).
 *
 * Null / malformed keys are included as null and logged — they indicate either
 * a legitimately unused feature or a real storage problem worth noticing.
 */
export function exportAllData() {
    const stores = {};

    for (const [name, key] of Object.entries(STORE_KEYS)) {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            stores[name] = null;
            continue;
        }
        try {
            stores[name] = JSON.parse(raw);
        } catch (err) {
            console.warn(`[soultrack export] Failed to parse store "${key}":`, err);
            stores[name] = null;
        }
    }

    const payload = {
        exportedAt: new Date().toISOString(),
        appVersion: '0.1',
        stores,
    };

    const json = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `soultracker-export-${dateStr}.json`;
    const blob = new Blob([json], { type: 'application/json' });

    // Web Share API — triggers native share/save sheet on iOS and Android.
    // canShare with a files array is the reliable guard (not all browsers implement it).
    const file = new File([blob], filename, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'SoulTracker Export' }).catch((err) => {
            // AbortError = user dismissed the share sheet, not a real failure.
            if (err.name !== 'AbortError') {
                console.warn('[soultrack export] Share failed, falling back to download:', err);
                triggerDownload(blob, filename);
            }
        });
        return;
    }

    // Desktop fallback: create a temporary object URL and click a hidden <a>.
    triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after a delay to let the browser finish reading the URL.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
