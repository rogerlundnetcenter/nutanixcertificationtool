import { bus } from './core/EventBus.js';
import { bridge } from './core/BridgeClient.js';
import { router } from './core/Router.js';
import { state } from './core/StateEngine.js';
import { PeDashboardView } from './views/pe-dashboard.js';
import { PeVmsView } from './views/pe-vms.js';
import { PeStorageView } from './views/pe-storage.js';
import { PeNetworkView } from './views/pe-network.js';
import { PeImagesView } from './views/pe-images.js';
import { PeProtectionView } from './views/pe-protection.js';
import { PeHardwareView } from './views/pe-hardware.js';
import { PeHealthView } from './views/pe-health.js';
import { PeSettingsView } from './views/pe-settings.js';
import { PeCliView } from './views/pe-cli.js';
import { PlaceholderView } from './views/PlaceholderView.js';

/**
 * App — Bootstrap the Nutanix Lab Simulator.
 */
class App {
    #context = 'pe'; // 'pe' or 'pc'
    #hamburgerOpen = false;

    async init() {
        // Initialize state engine
        await state.init();

        // Set up routing
        router.setContainer(document.getElementById('view-container'));
        this.#registerRoutes();

        // Wire up navigation
        this.#wireNavigation();

        // Start router
        router.start();

        // Notify C# bridge we're ready
        bridge.post('ready');

        // Listen for route changes to update nav highlights
        bus.on('route:changed', ({ path }) => this.#onRouteChanged(path));
    }

    #registerRoutes() {
        // PE routes
        router.register('/pe/dashboard', PeDashboardView);
        router.register('/pe/vms', PeVmsView);
        router.register('/pe/storage', PeStorageView);
        router.register('/pe/network', PeNetworkView);
        router.register('/pe/images', PeImagesView);
        router.register('/pe/protection', PeProtectionView);
        router.register('/pe/hardware', PeHardwareView);
        router.register('/pe/health', PeHealthView);
        router.register('/pe/settings', PeSettingsView);
        router.register('/pe/cli', PeCliView);

        // PC routes
        router.register('/pc/dashboard', this.#placeholder('PC Dashboard', 'pc'));
        router.register('/pc/vms', this.#placeholder('PC VMs', 'pc'));
        router.register('/pc/categories', this.#placeholder('Categories', 'pc'));
        router.register('/pc/flow', this.#placeholder('Flow Security', 'pc'));
        router.register('/pc/leap', this.#placeholder('Leap DR', 'pc'));
        router.register('/pc/planning', this.#placeholder('Planning', 'pc'));
    }

    #placeholder(title, ctx) {
        return class extends PlaceholderView {
            constructor() { super(title, ctx); }
        };
    }

    #wireNavigation() {
        // Hamburger toggle
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerOverlay = document.getElementById('hamburger-overlay');
        const hamburgerBackdrop = document.getElementById('hamburger-backdrop');

        hamburgerBtn?.addEventListener('click', () => this.#toggleHamburger());
        hamburgerBackdrop?.addEventListener('click', () => this.#closeHamburger());

        // Nav item clicks (PE hamburger)
        document.querySelectorAll('#hamburger-overlay .nav-item[data-route]').forEach(item => {
            item.addEventListener('click', () => {
                router.navigate(item.dataset.route);
                this.#closeHamburger();
            });
        });

        // Nav item clicks (PC sidebar)
        document.querySelectorAll('#pc-sidebar .nav-item[data-route]').forEach(item => {
            item.addEventListener('click', () => {
                router.navigate(item.dataset.route);
            });
        });

        // Context switcher
        const ctxSwitcher = document.getElementById('context-switcher');
        ctxSwitcher?.addEventListener('change', (e) => {
            this.#setContext(e.target.value);
        });
    }

    #toggleHamburger() {
        this.#hamburgerOpen = !this.#hamburgerOpen;
        document.getElementById('hamburger-overlay')?.classList.toggle('open', this.#hamburgerOpen);
        document.getElementById('hamburger-backdrop')?.classList.toggle('open', this.#hamburgerOpen);
    }

    #closeHamburger() {
        this.#hamburgerOpen = false;
        document.getElementById('hamburger-overlay')?.classList.remove('open');
        document.getElementById('hamburger-backdrop')?.classList.remove('open');
    }

    #setContext(ctx) {
        this.#context = ctx;
        const pcSidebar = document.getElementById('pc-sidebar');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const ctxLabel = document.getElementById('context-label');

        if (ctx === 'pc') {
            pcSidebar?.classList.add('active');
            hamburgerBtn.style.display = 'none';
            ctxLabel.textContent = 'Prism Central';
            this.#closeHamburger();
            router.navigate('/pc/dashboard');
        } else {
            pcSidebar?.classList.remove('active');
            hamburgerBtn.style.display = 'flex';
            ctxLabel.textContent = 'Prism Element';
            router.navigate('/pe/dashboard');
        }
    }

    #onRouteChanged({ path }) {
        // Update breadcrumb
        const bc = document.getElementById('breadcrumb');
        if (bc) {
            const parts = path.split('/').filter(Boolean);
            const ctx = parts[0] === 'pc' ? 'Prism Central' : 'Prism Element';
            const page = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
            bc.innerHTML = `<a href="#/${parts[0]}/dashboard">${ctx}</a><span class="separator">›</span><span class="current">${page || 'Dashboard'}</span>`;
        }

        // Highlight active nav items
        document.querySelectorAll('.nav-item[data-route]').forEach(item => {
            item.classList.toggle('active', item.dataset.route === path);
        });

        // Sync context switcher
        const isPC = path.startsWith('/pc');
        if ((isPC && this.#context !== 'pc') || (!isPC && this.#context !== 'pe')) {
            this.#context = isPC ? 'pc' : 'pe';
            const switcher = document.getElementById('context-switcher');
            if (switcher) switcher.value = this.#context;
            document.getElementById('pc-sidebar')?.classList.toggle('active', isPC);
            document.getElementById('hamburger-btn').style.display = isPC ? 'none' : 'flex';
            document.getElementById('context-label').textContent = isPC ? 'Prism Central' : 'Prism Element';
        }
    }
}

// Boot
const app = new App();
app.init().catch(err => console.error('[App] Init failed:', err));
