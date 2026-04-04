/**
 * BridgeClient — JS side of the IPC bridge to Electron main process.
 *
 * Electron replacement for the WebView2 PostMessage bridge.
 * Uses the contextBridge preload API (window.certStudy.lab) instead of
 * window.chrome.webview.  The public API (send, post, on) is unchanged
 * so all lab views continue to work without modification.
 *
 * Preload API consumed:
 *   window.certStudy.lab.send(type, payload)     – ipcRenderer.invoke (request/response)
 *   window.certStudy.lab.post(type, payload)      – ipcRenderer.send  (fire-and-forget)
 *   window.certStudy.lab.onMessage(callback)      – ipcRenderer.on    (main → renderer)
 */
class BridgeClient {
    #pending = new Map();
    #handlers = new Map();
    #idCounter = 0;
    #cleanup = null;

    constructor() {
        this.#cleanup = window.certStudy.lab.onMessage((data) => this.#onMessage(data));
    }

    /** Send a message to main and await a response. */
    send(type, payload) {
        const id = String(++this.#idCounter);

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.#pending.delete(id);
                reject(new Error(`Bridge timeout for ${type}`));
            }, 10_000);

            this.#pending.set(id, { resolve, reject, timer });

            window.certStudy.lab.send(type, { ...payload, id })
                .then(response => {
                    clearTimeout(timer);
                    this.#pending.delete(id);
                    resolve(response);
                })
                .catch(err => {
                    clearTimeout(timer);
                    this.#pending.delete(id);
                    reject(err);
                });
        });
    }

    /** Fire-and-forget message to main. */
    post(type, payload) {
        window.certStudy.lab.post(type, payload);
    }

    /** Register a handler for messages from main. */
    on(type, handler) {
        if (!this.#handlers.has(type)) this.#handlers.set(type, new Set());
        this.#handlers.get(type).add(handler);
    }

    #onMessage(data) {
        const { type, payload, id } = data;

        // Handle response to a pending request
        if (type === 'response' && id && this.#pending.has(id)) {
            const p = this.#pending.get(id);
            clearTimeout(p.timer);
            this.#pending.delete(id);
            payload?.success ? p.resolve(payload.data) : p.reject(new Error(payload?.error || 'Bridge error'));
            return;
        }

        // Dispatch to registered handlers
        this.#handlers.get(type)?.forEach(h => {
            try { h(payload); } catch (e) { console.error(`[Bridge] Handler error for ${type}:`, e); }
        });
    }

    /** Tear down the IPC listener. */
    destroy() {
        if (this.#cleanup) this.#cleanup();
        for (const p of this.#pending.values()) clearTimeout(p.timer);
        this.#pending.clear();
    }
}

export const bridge = new BridgeClient();
