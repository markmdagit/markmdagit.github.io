import React from 'react';
import ReactDOM from 'react-dom/client';

const PART_NUMBER_KEYS = new Set([
    "Screen Part #(s)",
    "Battery Part #(s)",
    "RAM Part #(s)",
    "SSD Part #(s)"
]);

const COMPONENT_TYPES = [
    { id: 'all', label: 'All Components & Specs' },
    { id: 'processor', label: 'Processor (CPU)' },
    { id: 'memory', label: 'Memory (RAM)' },
    { id: 'storage', label: 'Storage (Internal Drive / SSD)' },
    { id: 'display', label: 'Display & Screen' },
    { id: 'graphics', label: 'Graphics (GPU)' },
    { id: 'battery', label: 'Battery & Power' },
    { id: 'connectivity', label: 'Ports, Wireless & Peripherals' },
    { id: 'parts', label: 'Replacement Part Numbers' },
    { id: 'accessories', label: 'Accessories Only' },
    { id: 'supply_chain', label: 'Supply Chain & Manufacturing' }
];

const COMPONENT_SPEC_MAP = {
    processor: ['Processor', 'Processor Family'],
    memory: ['Memory', 'Memory Type', 'Memory Slots', 'RAM Part #(s)'],
    storage: ['Internal Drive', 'SSD Part #(s)'],
    display: ['Display', 'Screen Part #(s)'],
    graphics: ['Graphics'],
    battery: ['Battery', 'Power Supply', 'Battery Part #(s)'],
    connectivity: ['External I/O Ports', 'Wireless Technology', 'Webcam', 'Keyboard'],
    parts: ['Screen Part #(s)', 'Battery Part #(s)', 'RAM Part #(s)', 'SSD Part #(s)']
};

const COMPONENT_RAW_FIELD_MAP = {
    processor: ['Processor', 'Processor Family'],
    memory: ['Memory', 'Memory Type', 'Memory Slots', 'RAM Replacement Part # (Common)'],
    storage: ['Internal Drive', 'SSD Replacement Part # (Common)'],
    display: ['Display', 'Screen Replacement Part # (Common)'],
    graphics: ['Graphics'],
    battery: ['Battery', 'Power Supply', 'Battery Replacement Part # (Common)'],
    connectivity: ['External I/O Ports', 'Wireless Technology', 'Webcam', 'Keyboard', 'Pointing Device'],
    parts: [
        'Screen Replacement Part # (Common)',
        'Battery Replacement Part # (Common)',
        'RAM Replacement Part # (Common)',
        'SSD Replacement Part # (Common)'
    ]
};

const ACCESSORY_COMPONENT_SUBCATEGORIES = {
    all: null,
    accessories: null,
    parts: null,
    battery: ['Power Adapters'],
    connectivity: ['Docking Stations', 'Input Devices'],
    display: ['Input Devices', 'Security']
};

function isSafeHttpUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (_) {
        return false;
    }
}

function extractGeneration(modelName) {
    if (!modelName) return null;
    const match = modelName.match(/\b(G\d+[ia]?)\b/i);
    if (!match) return null;
    const gen = match[1];
    if (gen.toLowerCase() === 'g1a') return 'G1i';
    return gen;
}

function extractSeries(modelName) {
    if (!modelName) return null;
    const lower = modelName.toLowerCase();
    if (lower.includes('elitebook')) return 'Elitebook';
    if (lower.includes('zbook')) return 'Zbook Studio';
    return null;
}

function getSupplyChainForLaptop(laptop, supplyChainData) {
    if (!laptop || !Array.isArray(supplyChainData)) return null;
    const series = extractSeries(laptop.Model);
    const gen = extractGeneration(laptop.Model);
    if (!series || !gen) return null;
    return supplyChainData.find(
        item =>
            item['Model Series'] &&
            item['Model Series'].toLowerCase() === series.toLowerCase() &&
            item['Generation'] &&
            item['Generation'].toLowerCase() === gen.toLowerCase()
    ) || null;
}

const CopyToClipboard = ({ text }) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const timeoutRef = React.useRef(null);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copy = () => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setIsCopied(false);
                timeoutRef.current = null;
            }, 2000);
        }).catch(err => console.error('Failed to copy text:', err));
    };

    return (
        <button onClick={copy} className="copy-button" title="Copy to clipboard" type="button">
            {isCopied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
        </button>
    );
};

const LaptopCard = React.memo(({ laptop, supplyChain, activeComponent }) => {
    const [showMaps, setShowMaps] = React.useState(false);

    const coreSpecs = {
        "Processor": laptop.Processor,
        "Processor Family": laptop["Processor Family"],
        "Memory": laptop.Memory,
        "Memory Type": laptop["Memory Type"],
        "Memory Slots": laptop["Memory Slots"],
        "Internal Drive": laptop["Internal Drive"],
        "Display": laptop.Display,
        "Graphics": laptop.Graphics,
        "Battery": laptop.Battery,
        "Power Supply": laptop["Power Supply"],
        "External I/O Ports": laptop["External I/O Ports"],
        "Wireless Technology": laptop["Wireless Technology"],
        "Webcam": laptop.Webcam,
        "Keyboard": laptop.Keyboard,
        "Screen Part #(s)": laptop["Screen Replacement Part # (Common)"],
        "Battery Part #(s)": laptop["Battery Replacement Part # (Common)"],
        "RAM Part #(s)": laptop["RAM Replacement Part # (Common)"],
        "SSD Part #(s)": laptop["SSD Replacement Part # (Common)"]
    };

    const defaultVisibleKeys = new Set([
        "Processor",
        "Memory",
        "Internal Drive",
        "Display",
        "Graphics",
        "Screen Part #(s)",
        "Battery Part #(s)",
        "RAM Part #(s)",
        "SSD Part #(s)"
    ]);

    const highlightedKeys = COMPONENT_SPEC_MAP[activeComponent]
        ? new Set(COMPONENT_SPEC_MAP[activeComponent])
        : null;

    const specsEntries = Object.entries(coreSpecs).filter(([key, value]) => {
        if (!value) return false;
        if (highlightedKeys) {
            return highlightedKeys.has(key);
        }
        return defaultVisibleKeys.has(key);
    });

    const locations = supplyChain && Array.isArray(supplyChain["Typical Final Assembly Location(s)"])
        ? supplyChain["Typical Final Assembly Location(s)"].map(l => l.name).join(', ')
        : null;

    const partners = supplyChain && Array.isArray(supplyChain["Primary Assembly Partners (ODMs)"])
        ? supplyChain["Primary Assembly Partners (ODMs)"]
        : [];

    const partnerNames = partners.length > 0
        ? partners.map(p => p.name).join(', ')
        : null;

    const notes = supplyChain ? supplyChain["Notes & Context"] : null;

    const showSupplyChainSection = supplyChain && (
        activeComponent === 'all' ||
        activeComponent === 'supply_chain' ||
        !highlightedKeys
    );

    return (
        <div className="laptop-card">
            <h3>{laptop.Model}</h3>
            {specsEntries.map(([key, value]) => (
                <div
                    key={key}
                    className={`spec ${highlightedKeys && highlightedKeys.has(key) ? 'spec-highlighted' : ''}`}
                >
                    <span className="spec-key">{key}:</span>
                    <span className="spec-value">{value}</span>
                    {PART_NUMBER_KEYS.has(key) && <CopyToClipboard text={value} />}
                </div>
            ))}

            {showSupplyChainSection && (
                <div className="laptop-supply-chain-summary">
                    <div className="supply-chain-divider">
                        <i className="fas fa-globe-americas"></i> Supply Chain &amp; Manufacturing ({supplyChain.Generation})
                    </div>
                    {locations && (
                        <div className="spec">
                            <span className="spec-key">Assembly Location(s):</span>
                            <span className="spec-value">{locations}</span>
                        </div>
                    )}
                    {partnerNames && (
                        <div className="spec">
                            <span className="spec-key">Assembly Partners (ODMs):</span>
                            <span className="spec-value">{partnerNames}</span>
                        </div>
                    )}
                    {notes && (
                        <div className="spec">
                            <span className="spec-key">Notes &amp; Context:</span>
                            <span className="spec-value">{notes}</span>
                        </div>
                    )}
                    {partners.some(p => isSafeHttpUrl(p.map_url)) && (
                        <div className="map-toggle-wrapper">
                            <button
                                type="button"
                                className="map-toggle-btn"
                                onClick={() => setShowMaps(prev => !prev)}
                            >
                                <i className={`fas ${showMaps ? 'fa-chevron-up' : 'fa-map-marked-alt'}`}></i>{' '}
                                {showMaps ? 'Hide ODM Partner Maps' : `View ODM Partner Maps (${partners.length})`}
                            </button>
                            {showMaps && partners.map(partner => (
                                isSafeHttpUrl(partner.map_url) && (
                                    <div key={partner.name} className="map-container">
                                        <div className="map-partner-label">{partner.name}</div>
                                        <iframe
                                            src={partner.map_url}
                                            width="100%"
                                            height="220"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            sandbox="allow-scripts allow-same-origin allow-popups"
                                            title={`Map of ${partner.name} headquarters`}
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

const AccessoryCard = React.memo(({ accessory }) => {
    return (
        <div className="laptop-card">
            <h3>{accessory.model}</h3>
            {accessory.part_number && (
                <div className="spec">
                    <span className="spec-key">Part Number:</span>
                    <span className="spec-value">{accessory.part_number}</span>
                    <CopyToClipboard text={accessory.part_number} />
                </div>
            )}
            {accessory.description && (
                <div className="spec">
                    <span className="spec-key">Description:</span>
                    <span className="spec-value">{accessory.description}</span>
                </div>
            )}
        </div>
    );
});

const SupplyChainCard = React.memo(({ item }) => {
    const locations = Array.isArray(item["Typical Final Assembly Location(s)"])
        ? item["Typical Final Assembly Location(s)"].map(loc => loc.name).join(', ')
        : item["Typical Final Assembly Location(s)"];

    const partners = Array.isArray(item["Primary Assembly Partners (ODMs)"])
        ? item["Primary Assembly Partners (ODMs)"]
        : [];

    const partnerNames = partners.map(p => p.name).join(', ');
    const notes = item["Notes & Context"];

    return (
        <div className="laptop-card">
            <h3>{item["Model Series"]} {item["Generation"]}</h3>
            {locations && (
                <div className="spec">
                    <span className="spec-key">Assembly Location(s):</span>
                    <span className="spec-value">{locations}</span>
                </div>
            )}
            {partnerNames && (
                <div className="spec">
                    <span className="spec-key">Assembly Partners (ODMs):</span>
                    <span className="spec-value">{partnerNames}</span>
                </div>
            )}
            {notes && (
                <div className="spec">
                    <span className="spec-key">Notes &amp; Context:</span>
                    <span className="spec-value">{notes}</span>
                </div>
            )}
            {partners.map(partner => (
                isSafeHttpUrl(partner.map_url) && (
                    <div key={partner.name} className="map-container">
                        <iframe
                            src={partner.map_url}
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                            title={`Map of ${partner.name} headquarters`}
                        />
                    </div>
                )
            ))}
        </div>
    );
});

const AccessoriesSection = ({ allAccessories, searchQuery, selectedModel, selectedComponent }) => {
    const filteredAccessories = React.useMemo(() => {
        if (
            selectedComponent !== 'all' &&
            selectedComponent !== 'accessories' &&
            selectedComponent !== 'parts' &&
            !ACCESSORY_COMPONENT_SUBCATEGORIES[selectedComponent]
        ) {
            return {};
        }

        const allowedSubCategories = ACCESSORY_COMPONENT_SUBCATEGORIES[selectedComponent];
        const query = searchQuery.trim().toLowerCase();
        const filtered = {};

        let modelSeriesFilter = null;
        if (selectedModel === 'series:EliteBook') {
            modelSeriesFilter = 'elitebook';
        } else if (selectedModel === 'series:ZBook') {
            modelSeriesFilter = 'zbook';
        } else if (selectedModel !== 'all') {
            const lowerModel = selectedModel.toLowerCase();
            if (lowerModel.includes('elitebook')) modelSeriesFilter = 'elitebook';
            else if (lowerModel.includes('zbook')) modelSeriesFilter = 'zbook';
        }

        for (const category in allAccessories) {
            if (modelSeriesFilter && !category.toLowerCase().includes(modelSeriesFilter)) {
                continue;
            }

            const items = allAccessories[category];
            const filteredItems = {};

            for (const subCategory in items) {
                if (allowedSubCategories && !allowedSubCategories.includes(subCategory)) {
                    continue;
                }

                const subItems = items[subCategory];
                const filteredSubItems = subItems.filter(item => {
                    if (!query) return true;
                    const modelMatch = item.model && item.model.toLowerCase().includes(query);
                    const partNumberMatch = item.part_number && item.part_number.toLowerCase().includes(query);
                    const descriptionMatch = item.description && item.description.toLowerCase().includes(query);
                    const categoryMatch = subCategory.toLowerCase().includes(query) || category.toLowerCase().includes(query);
                    return modelMatch || partNumberMatch || descriptionMatch || categoryMatch;
                });

                if (filteredSubItems.length > 0) {
                    filteredItems[subCategory] = filteredSubItems;
                }
            }

            if (Object.keys(filteredItems).length > 0) {
                filtered[category] = filteredItems;
            }
        }

        return filtered;
    }, [allAccessories, searchQuery, selectedModel, selectedComponent]);

    const hasResults = Object.keys(filteredAccessories).length > 0;
    if (!hasResults) return null;

    return (
        <div className="unified-section" id="accessories-section">
            <h2 className="section-title">Laptop Accessories</h2>
            {Object.entries(filteredAccessories).map(([category, items]) => (
                <React.Fragment key={category}>
                    <h3 className="section-title">{category}</h3>
                    {Object.entries(items).map(([subCategory, subItems]) => (
                        <React.Fragment key={subCategory}>
                            <h4 className="section-title">{subCategory}</h4>
                            <div className="card-grid">
                                {subItems.map(item => <AccessoryCard key={item.model} accessory={item} />)}
                            </div>
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

const SupplyChainSection = ({ supplyChainData, searchQuery, selectedModel, selectedComponent }) => {
    const filteredSupplyChain = React.useMemo(() => {
        if (
            selectedComponent !== 'all' &&
            selectedComponent !== 'supply_chain'
        ) {
            return [];
        }

        const query = searchQuery.trim().toLowerCase();

        return supplyChainData.filter(item => {
            const series = (item["Model Series"] || '').toLowerCase();
            const gen = (item["Generation"] || '').toLowerCase();

            if (selectedModel === 'series:EliteBook' && series !== 'elitebook') return false;
            if (selectedModel === 'series:ZBook' && series !== 'zbook studio') return false;
            if (selectedModel !== 'all' && !selectedModel.startsWith('series:')) {
                const targetSeries = extractSeries(selectedModel);
                const targetGen = extractGeneration(selectedModel);
                if (targetSeries && series !== targetSeries.toLowerCase()) return false;
                if (targetGen && gen !== targetGen.toLowerCase()) return false;
            }

            if (!query) return true;

            const titleMatch = `${series} ${gen}`.includes(query) || `hp ${series} ${gen}`.includes(query);
            const notesMatch = item["Notes & Context"] && item["Notes & Context"].toLowerCase().includes(query);
            const locMatch = Array.isArray(item["Typical Final Assembly Location(s)"]) &&
                item["Typical Final Assembly Location(s)"].some(l => l.name && l.name.toLowerCase().includes(query));
            const partnerMatch = Array.isArray(item["Primary Assembly Partners (ODMs)"]) &&
                item["Primary Assembly Partners (ODMs)"].some(p => p.name && p.name.toLowerCase().includes(query));

            return titleMatch || notesMatch || locMatch || partnerMatch;
        });
    }, [supplyChainData, searchQuery, selectedModel, selectedComponent]);

    if (filteredSupplyChain.length === 0) return null;

    const elitebookSupply = filteredSupplyChain.filter(item => item["Model Series"] === "Elitebook");
    const zbookSupply = filteredSupplyChain.filter(item => item["Model Series"] === "Zbook Studio");

    return (
        <div className="unified-section" id="supply-chain-section">
            <h2 className="section-title">Laptop Supply Chain Analysis &amp; History</h2>
            {elitebookSupply.length > 0 && (
                <React.Fragment>
                    <h3 className="section-title">HP EliteBook</h3>
                    <div id="elitebook-supply-chain-cards" className="card-grid">
                        {elitebookSupply.map(item => (
                            <SupplyChainCard key={`${item["Model Series"]}-${item["Generation"]}`} item={item} />
                        ))}
                    </div>
                </React.Fragment>
            )}
            {zbookSupply.length > 0 && (
                <React.Fragment>
                    <h3 className="section-title">HP ZBook Studio</h3>
                    <div id="zbook-supply-chain-cards" className="card-grid">
                        {zbookSupply.map(item => (
                            <SupplyChainCard key={`${item["Model Series"]}-${item["Generation"]}`} item={item} />
                        ))}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

const Laptops = () => {
    const [allLaptops, setAllLaptops] = React.useState([]);
    const [allAccessories, setAllAccessories] = React.useState({});
    const [supplyChainData, setSupplyChainData] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedModel, setSelectedModel] = React.useState('all');
    const [selectedComponent, setSelectedComponent] = React.useState('all');
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        Promise.all([
            fetch('../data/laptops.json').then(res => {
                if (!res.ok) throw new Error('Failed to fetch laptops.json');
                return res.json();
            }),
            fetch('../data/accessories.json').then(res => {
                if (!res.ok) throw new Error('Failed to fetch accessories.json');
                return res.json();
            }),
            fetch('../data/supply_chain.json').then(res => {
                if (!res.ok) throw new Error('Failed to fetch supply_chain.json');
                return res.json();
            })
        ])
            .then(([laptops, accessories, supplyChain]) => {
                setAllLaptops(laptops || []);
                setAllAccessories(accessories || {});
                setSupplyChainData(supplyChain || []);
            })
            .catch(error => console.error('Error loading product database:', error))
            .finally(() => setIsLoading(false));

        const handleSearch = (event) => {
            setSearchQuery(typeof event.detail === 'string' ? event.detail : '');
        };

        document.addEventListener('searchQueryChanged', handleSearch);
        return () => {
            document.removeEventListener('searchQueryChanged', handleSearch);
        };
    }, []);

    const filteredLaptops = React.useMemo(() => {
        if (selectedComponent === 'accessories') {
            return [];
        }

        const query = searchQuery.trim().toLowerCase();
        const componentFields = COMPONENT_RAW_FIELD_MAP[selectedComponent] || null;

        return allLaptops.filter(laptop => {
            if (selectedModel === 'series:EliteBook') {
                if (!laptop.Model || !laptop.Model.toLowerCase().includes('elitebook')) return false;
            } else if (selectedModel === 'series:ZBook') {
                if (!laptop.Model || !laptop.Model.toLowerCase().includes('zbook')) return false;
            } else if (selectedModel !== 'all') {
                if (laptop.Model !== selectedModel) return false;
            }

            const supplyChain = getSupplyChainForLaptop(laptop, supplyChainData);

            if (selectedComponent === 'supply_chain' && !supplyChain) {
                return false;
            }

            if (!query) {
                if (componentFields) {
                    return componentFields.some(field => Boolean(laptop[field]));
                }
                return true;
            }

            const modelMatch = laptop.Model && laptop.Model.toLowerCase().includes(query);

            if (selectedComponent === 'supply_chain') {
                if (!supplyChain) return false;
                const locMatch = Array.isArray(supplyChain["Typical Final Assembly Location(s)"]) &&
                    supplyChain["Typical Final Assembly Location(s)"].some(l => l.name && l.name.toLowerCase().includes(query));
                const partnerMatch = Array.isArray(supplyChain["Primary Assembly Partners (ODMs)"]) &&
                    supplyChain["Primary Assembly Partners (ODMs)"].some(p => p.name && p.name.toLowerCase().includes(query));
                const notesMatch = supplyChain["Notes & Context"] && supplyChain["Notes & Context"].toLowerCase().includes(query);
                return modelMatch || locMatch || partnerMatch || notesMatch;
            }

            if (componentFields) {
                const fieldMatch = componentFields.some(field => {
                    const val = laptop[field];
                    return typeof val === 'string' && val.toLowerCase().includes(query);
                });
                return modelMatch || fieldMatch;
            }

            const allFieldsMatch = Object.values(laptop).some(
                val => typeof val === 'string' && val.toLowerCase().includes(query)
            );

            const supplyChainMatch = supplyChain && (
                (Array.isArray(supplyChain["Typical Final Assembly Location(s)"]) &&
                    supplyChain["Typical Final Assembly Location(s)"].some(l => l.name && l.name.toLowerCase().includes(query))) ||
                (Array.isArray(supplyChain["Primary Assembly Partners (ODMs)"]) &&
                    supplyChain["Primary Assembly Partners (ODMs)"].some(p => p.name && p.name.toLowerCase().includes(query))) ||
                (supplyChain["Notes & Context"] && supplyChain["Notes & Context"].toLowerCase().includes(query))
            );

            return modelMatch || allFieldsMatch || Boolean(supplyChainMatch);
        });
    }, [allLaptops, supplyChainData, searchQuery, selectedModel, selectedComponent]);

    const hasActiveFilters = searchQuery.trim() !== '' || selectedModel !== 'all' || selectedComponent !== 'all';

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedModel('all');
        setSelectedComponent('all');
    };

    return (
        <React.Fragment>
            <h2 className="section-title">Enterprise Laptops Database &amp; Global Supply Chain</h2>
            <p className="database-intro">
                Explore hardware specifications, common replacement part numbers, compatible enterprise accessories, and global ODM manufacturing &amp; supply chain history across HP EliteBook and ZBook generations.
            </p>

            <div className="search-engine-panel" role="search" aria-label="Product and Component Search Engine">
                <div className="search-controls-grid">
                    <div className="search-control-group search-input-group">
                        <label htmlFor="laptop-search-input">
                            <i className="fas fa-search"></i> Search Keyword, Part #, ODM, or Location
                        </label>
                        <input
                            id="laptop-search-input"
                            type="search"
                            className="form-control search-input"
                            placeholder="e.g., G8, i7, DDR5, M73466-005, Quanta, Vietnam, Thunderbolt..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="search-control-group">
                        <label htmlFor="model-filter">
                            <i className="fas fa-laptop"></i> Filter by Model
                        </label>
                        <select
                            id="model-filter"
                            className="form-control search-select"
                            value={selectedModel}
                            onChange={e => setSelectedModel(e.target.value)}
                        >
                            <option value="all">All Models ({allLaptops.length})</option>
                            <option value="series:EliteBook">HP EliteBook Series (All)</option>
                            <option value="series:ZBook">HP ZBook Series (All)</option>
                            <optgroup label="Individual Laptop Models">
                                {allLaptops.map(laptop => (
                                    <option key={laptop.Model} value={laptop.Model}>
                                        {laptop.Model}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="search-control-group">
                        <label htmlFor="component-filter">
                            <i className="fas fa-microchip"></i> Filter by Component Type
                        </label>
                        <select
                            id="component-filter"
                            className="form-control search-select"
                            value={selectedComponent}
                            onChange={e => setSelectedComponent(e.target.value)}
                        >
                            {COMPONENT_TYPES.map(ct => (
                                <option key={ct.id} value={ct.id}>
                                    {ct.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="component-pills" role="group" aria-label="Quick Component Type Filters">
                    {COMPONENT_TYPES.map(ct => (
                        <button
                            key={ct.id}
                            type="button"
                            className={`component-pill ${selectedComponent === ct.id ? 'active' : ''}`}
                            onClick={() => setSelectedComponent(ct.id)}
                        >
                            {ct.label}
                        </button>
                    ))}
                </div>

                <div className="search-status-bar">
                    <span>
                        Showing <strong>{filteredLaptops.length}</strong> laptop model{filteredLaptops.length === 1 ? '' : 's'}
                        {selectedComponent !== 'all' && (
                            <span> focused on <strong>{COMPONENT_TYPES.find(c => c.id === selectedComponent)?.label}</strong></span>
                        )}
                    </span>
                    {hasActiveFilters && (
                        <button type="button" className="reset-filters-btn" onClick={resetFilters}>
                            <i className="fas fa-undo"></i> Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i> Loading laptop specifications, accessories, and supply chain data...
                </div>
            ) : (
                <React.Fragment>
                    {filteredLaptops.length > 0 && (
                        <div className="unified-section" id="laptop-specs-section">
                            <h3 className="section-title">Laptop Specifications &amp; Replacement Parts</h3>
                            <div className="card-grid">
                                {filteredLaptops.map(laptop => (
                                    <LaptopCard
                                        key={laptop.Model}
                                        laptop={laptop}
                                        supplyChain={getSupplyChainForLaptop(laptop, supplyChainData)}
                                        activeComponent={selectedComponent}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <AccessoriesSection
                        allAccessories={allAccessories}
                        searchQuery={searchQuery}
                        selectedModel={selectedModel}
                        selectedComponent={selectedComponent}
                    />

                    <SupplyChainSection
                        supplyChainData={supplyChainData}
                        searchQuery={searchQuery}
                        selectedModel={selectedModel}
                        selectedComponent={selectedComponent}
                    />

                    {filteredLaptops.length === 0 &&
                        selectedComponent !== 'accessories' &&
                        selectedComponent !== 'supply_chain' && (
                            <p className="no-results-message">
                                No matching products or components found for your search criteria. Try clearing or adjusting your filters.
                            </p>
                        )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<Laptops />);
}