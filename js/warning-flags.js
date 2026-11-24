(function () {
    'use strict';

    const STORAGE_KEY = 'warning_flags_events_v1';

    const FLAG_META = [
        {
            key: 'white',
            name: 'White Flag',
            tier: 'Level 1',
            fillPercent: 0
        },
        {
            key: 'grey',
            name: 'Grey Flag',
            tier: 'Level 2',
            fillPercent: 33.33
        },
        {
            key: 'red',
            name: 'Red Flag',
            tier: 'Level 3',
            fillPercent: 66.67
        },
        {
            key: 'black',
            name: 'Black Flag',
            tier: 'Level 4',
            fillPercent: 100
        }
    ];

    const DEFAULT_EVENTS = [
        {
            id: 'covid-2019',
            title: '2019 COVID-19 Pandemic',
            context:
                'During the 2019 COVID pandemic, what kept me sane through the first rough few years was creating a mental model of how bad it could get. Measuring the situation against clear, predefined flags kept perspective anchored in reality.',
            builtIn: true,
            activeIndex: 1,
            flags: {
                white: "No issues — the pandemic wasn't here, and no one was sick from COVID.",
                grey: 'Signs of societal issues, quarantining individuals or groups.',
                red: 'Someone I knew had COVID.',
                black: 'I or someone in my immediate family got COVID.'
            }
        }
    ];

    class WarningFlagsApp {
        constructor() {
            this.events = this.loadEvents();
            this.currentEventId = this.events[0].id;

            // Cache DOM elements
            this.tabsEl = document.getElementById('wf-event-tabs');
            this.newEventBtn = document.getElementById('wf-new-event-btn');
            this.deleteEventBtn = document.getElementById('wf-delete-event-btn');
            this.formPanel = document.getElementById('wf-form-panel');
            this.formEl = document.getElementById('wf-event-form');
            this.cancelFormBtn = document.getElementById('wf-cancel-form-btn');

            this.eventTitleEl = document.getElementById('wf-event-title');
            this.eventContextEl = document.getElementById('wf-event-context');
            this.statusSwatchEl = document.getElementById('wf-status-swatch');
            this.statusLabelEl = document.getElementById('wf-status-label');
            this.scorePillEl = document.getElementById('wf-score-pill');

            this.trackFillEl = document.getElementById('wf-track-fill-inner');
            this.trackContainerEl = document.getElementById('wf-track-container');
            this.nodesLayerEl = document.getElementById('wf-nodes-layer');
            this.labelsRowEl = document.getElementById('wf-labels-row');

            this.detailBadgeEl = document.getElementById('wf-detail-badge');
            this.detailHeadingEl = document.getElementById('wf-detail-heading');
            this.detailDescEl = document.getElementById('wf-detail-description');
            this.prevBtn = document.getElementById('wf-prev-flag-btn');
            this.nextBtn = document.getElementById('wf-next-flag-btn');

            this.legendGridEl = document.getElementById('wf-legend-grid');

            this.buildStaticBar();
            this.bindEvents();
            this.render();
        }

        loadEvents() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return DEFAULT_EVENTS.map((e) => ({ ...e, flags: { ...e.flags } }));
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) || parsed.length === 0) {
                    return DEFAULT_EVENTS.map((e) => ({ ...e, flags: { ...e.flags } }));
                }
                // Ensure the built-in example is always present
                const hasDefault = parsed.some((e) => e && e.id === 'covid-2019');
                if (!hasDefault) {
                    parsed.unshift({ ...DEFAULT_EVENTS[0], flags: { ...DEFAULT_EVENTS[0].flags } });
                }
                return parsed.filter(
                    (e) =>
                        e &&
                        typeof e.id === 'string' &&
                        typeof e.title === 'string' &&
                        e.flags &&
                        typeof e.flags === 'object'
                );
            } catch (_) {
                return DEFAULT_EVENTS.map((e) => ({ ...e, flags: { ...e.flags } }));
            }
        }

        saveEvents() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
            } catch (_) {
                // Ignore storage quota or restricted-mode errors
            }
        }

        getCurrentEvent() {
            return this.events.find((e) => e.id === this.currentEventId) || this.events[0];
        }

        buildStaticBar() {
            this.nodeButtons = [];
            this.labelButtons = [];

            FLAG_META.forEach((flag, index) => {
                // Circular flag milestone node on the single horizontal line
                const nodeBtn = document.createElement('button');
                nodeBtn.type = 'button';
                nodeBtn.className = 'wf-flag-node';
                nodeBtn.dataset.flag = flag.key;
                nodeBtn.dataset.index = String(index);
                nodeBtn.setAttribute('aria-label', `${flag.name} (${flag.tier})`);
                nodeBtn.title = `${flag.name} — ${flag.tier}`;

                const icon = document.createElement('i');
                icon.className = 'fas fa-flag';
                icon.setAttribute('aria-hidden', 'true');
                nodeBtn.appendChild(icon);

                nodeBtn.addEventListener('click', () => this.setActiveFlag(index));
                nodeBtn.addEventListener('keydown', (e) => this.handleBarKeydown(e, index));

                this.nodesLayerEl.appendChild(nodeBtn);
                this.nodeButtons.push(nodeBtn);

                // Label directly below each milestone
                const labelBtn = document.createElement('button');
                labelBtn.type = 'button';
                labelBtn.className = 'wf-flag-label-btn';
                labelBtn.dataset.index = String(index);

                const nameSpan = document.createElement('span');
                nameSpan.textContent = flag.name;
                const tierSpan = document.createElement('span');
                tierSpan.className = 'wf-flag-tier';
                tierSpan.textContent = flag.tier;

                labelBtn.appendChild(nameSpan);
                labelBtn.appendChild(tierSpan);
                labelBtn.addEventListener('click', () => this.setActiveFlag(index));

                this.labelsRowEl.appendChild(labelBtn);
                this.labelButtons.push(labelBtn);
            });
        }

        bindEvents() {
            this.prevBtn.addEventListener('click', () => {
                const ev = this.getCurrentEvent();
                if (ev.activeIndex > 0) {
                    this.setActiveFlag(ev.activeIndex - 1);
                }
            });

            this.nextBtn.addEventListener('click', () => {
                const ev = this.getCurrentEvent();
                if (ev.activeIndex < FLAG_META.length - 1) {
                    this.setActiveFlag(ev.activeIndex + 1);
                }
            });

            this.newEventBtn.addEventListener('click', () => {
                const isHidden = this.formPanel.hasAttribute('hidden');
                if (isHidden) {
                    this.formPanel.removeAttribute('hidden');
                    const titleInput = document.getElementById('wf-input-title');
                    if (titleInput) titleInput.focus();
                } else {
                    this.formPanel.setAttribute('hidden', '');
                }
            });

            this.cancelFormBtn.addEventListener('click', () => {
                this.formEl.reset();
                this.formPanel.setAttribute('hidden', '');
            });

            this.deleteEventBtn.addEventListener('click', () => {
                const ev = this.getCurrentEvent();
                if (ev.builtIn) return;
                this.events = this.events.filter((item) => item.id !== ev.id);
                this.currentEventId = this.events[0].id;
                this.saveEvents();
                this.render();
            });

            this.formEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('wf-input-title').value.trim();
                const context = document.getElementById('wf-input-context').value.trim();
                const white = document.getElementById('wf-input-white').value.trim();
                const grey = document.getElementById('wf-input-grey').value.trim();
                const red = document.getElementById('wf-input-red').value.trim();
                const black = document.getElementById('wf-input-black').value.trim();

                if (!title || !white || !grey || !red || !black) return;

                const newEvent = {
                    id: 'event-' + Date.now(),
                    title,
                    context: context || 'Custom event severity scale tracked across four warning flags.',
                    builtIn: false,
                    activeIndex: 0,
                    flags: { white, grey, red, black }
                };

                this.events.push(newEvent);
                this.currentEventId = newEvent.id;
                this.saveEvents();
                this.formEl.reset();
                this.formPanel.setAttribute('hidden', '');
                this.render();
            });
        }

        handleBarKeydown(e, currentIndex) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                const next = Math.min(FLAG_META.length - 1, currentIndex + 1);
                this.setActiveFlag(next);
                this.nodeButtons[next].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                const prev = Math.max(0, currentIndex - 1);
                this.setActiveFlag(prev);
                this.nodeButtons[prev].focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.setActiveFlag(0);
                this.nodeButtons[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                const last = FLAG_META.length - 1;
                this.setActiveFlag(last);
                this.nodeButtons[last].focus();
            }
        }

        setActiveFlag(index) {
            const ev = this.getCurrentEvent();
            const bounded = Math.max(0, Math.min(FLAG_META.length - 1, index));
            ev.activeIndex = bounded;
            this.saveEvents();
            this.renderActiveState();
        }

        render() {
            this.renderTabs();
            this.renderActiveState();
        }

        renderTabs() {
            while (this.tabsEl.firstChild) {
                this.tabsEl.removeChild(this.tabsEl.firstChild);
            }

            this.events.forEach((ev) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'wf-event-tab' + (ev.id === this.currentEventId ? ' active' : '');
                btn.setAttribute('aria-pressed', ev.id === this.currentEventId ? 'true' : 'false');

                const icon = document.createElement('i');
                icon.className = ev.builtIn ? 'fas fa-shield-virus' : 'fas fa-flag';
                icon.setAttribute('aria-hidden', 'true');

                const label = document.createElement('span');
                label.textContent = ev.title;

                btn.appendChild(icon);
                btn.appendChild(label);

                btn.addEventListener('click', () => {
                    this.currentEventId = ev.id;
                    this.render();
                });

                this.tabsEl.appendChild(btn);
            });
        }

        renderActiveState() {
            const ev = this.getCurrentEvent();
            const idx = Math.max(0, Math.min(FLAG_META.length - 1, ev.activeIndex || 0));
            const activeFlag = FLAG_META[idx];

            // Event header
            this.eventTitleEl.textContent = ev.title;
            this.eventContextEl.textContent = ev.context;

            // Show/hide delete button for custom events
            if (ev.builtIn) {
                this.deleteEventBtn.setAttribute('hidden', '');
            } else {
                this.deleteEventBtn.removeAttribute('hidden');
            }

            // Status readout pill
            this.statusSwatchEl.dataset.flag = activeFlag.key;
            this.statusLabelEl.textContent = activeFlag.name;
            this.scorePillEl.textContent = `Level ${idx + 1} / ${FLAG_META.length}`;

            // Gradient progress bar fill
            this.trackFillEl.style.setProperty('--wf-fill-pct', `${activeFlag.fillPercent}%`);
            this.trackContainerEl.setAttribute('aria-valuenow', String(idx + 1));
            this.trackContainerEl.setAttribute('aria-valuetext', `${activeFlag.name}: ${ev.flags[activeFlag.key]}`);

            // Update milestone nodes & labels
            this.nodeButtons.forEach((btn, i) => {
                btn.classList.toggle('active', i === idx);
                btn.classList.toggle('reached', i <= idx);
                btn.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
            });

            this.labelButtons.forEach((btn, i) => {
                btn.classList.toggle('active', i === idx);
            });

            // Update spotlight detail panel
            this.detailBadgeEl.dataset.flag = activeFlag.key;
            this.detailHeadingEl.textContent = `${activeFlag.name} — ${activeFlag.tier}`;
            this.detailDescEl.textContent = ev.flags[activeFlag.key] || '';

            this.prevBtn.disabled = idx === 0;
            this.prevBtn.style.opacity = idx === 0 ? '0.45' : '1';
            this.nextBtn.disabled = idx === FLAG_META.length - 1;
            this.nextBtn.style.opacity = idx === FLAG_META.length - 1 ? '0.45' : '1';

            // Update 4-flag reference grid
            this.renderLegend(ev, idx);
        }

        renderLegend(ev, activeIdx) {
            while (this.legendGridEl.firstChild) {
                this.legendGridEl.removeChild(this.legendGridEl.firstChild);
            }

            FLAG_META.forEach((flag, i) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'wf-legend-card' + (i === activeIdx ? ' active' : '');
                card.dataset.flag = flag.key;
                card.setAttribute('aria-pressed', i === activeIdx ? 'true' : 'false');

                const topRow = document.createElement('div');
                topRow.className = 'wf-legend-card-top';

                const tag = document.createElement('span');
                tag.className = 'wf-legend-flag-tag';

                const iconWrap = document.createElement('span');
                iconWrap.className = 'wf-legend-icon';
                iconWrap.dataset.flag = flag.key;
                const icon = document.createElement('i');
                icon.className = 'fas fa-flag';
                icon.setAttribute('aria-hidden', 'true');
                iconWrap.appendChild(icon);

                const nameText = document.createElement('span');
                nameText.textContent = flag.name;

                tag.appendChild(iconWrap);
                tag.appendChild(nameText);

                const levelText = document.createElement('span');
                levelText.className = 'wf-legend-level';
                levelText.textContent = `${i + 1}/4`;

                topRow.appendChild(tag);
                topRow.appendChild(levelText);

                const desc = document.createElement('p');
                desc.className = 'wf-legend-desc';
                desc.textContent = ev.flags[flag.key] || '';

                card.appendChild(topRow);
                card.appendChild(desc);

                card.addEventListener('click', () => this.setActiveFlag(i));
                this.legendGridEl.appendChild(card);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('wf-track-container')) {
            new WarningFlagsApp();
        }
    });
})();
