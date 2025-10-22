import React from 'react';
import ReactDOM from 'react-dom/client';

const CopyToClipboard = ({ text }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        });
    };

    return (
        <button onClick={copy} className="copy-button" title="Copy to clipboard">
            {isCopied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
        </button>
    );
};

const LaptopCard = ({ laptop }) => {
    const specsToShow = {
        "Processor": laptop.Processor,
        "Memory": laptop.Memory,
        "Internal Drive": laptop["Internal Drive"],
        "Display": laptop.Display,
        "Graphics": laptop.Graphics,
        "Screen Part #(s)": laptop["Screen Replacement Part # (Common)"],
        "Battery Part #(s)": laptop["Battery Replacement Part # (Common)"],
        "RAM Part #(s)": laptop["RAM Replacement Part # (Common)"],
        "SSD Part #(s)": laptop["SSD Replacement Part # (Common)"]
    };

    const partNumberKeys = ["Screen Part #(s)", "Battery Part #(s)", "RAM Part #(s)", "SSD Part #(s)"];

    return (
        <div className="laptop-card">
            <h3>{laptop.Model}</h3>
            {Object.entries(specsToShow).map(([key, value]) => {
                if (value) {
                    return (
                        <div key={key} className="spec">
                            <span className="spec-key">{key}:</span>
                            <span className="spec-value">{value}</span>
                            {partNumberKeys.includes(key) && <CopyToClipboard text={value} />}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

const AccessoryCard = ({ accessory }) => {
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
};

const Accessories = () => {
    const [accessories, setAccessories] = React.useState({});

    React.useEffect(() => {
        fetch('/data/accessories.json')
            .then(response => response.json())
            .then(data => setAccessories(data));
    }, []);

    return (
        <React.Fragment>
            <h2 className="section-title">Laptop Accessories</h2>
            {Object.entries(accessories).map(([category, items]) => (
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
        </React.Fragment>
    );
};

const Laptops = () => {
    const [allLaptops, setAllLaptops] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        fetch('/data/laptops.json')
            .then(response => response.json())
            .then(data => {
                setAllLaptops(data);
            })
            .catch(error => console.error('Error fetching laptop data:', error));

        const handleSearch = (event) => {
            setSearchQuery(event.detail);
        };

        document.addEventListener('searchQueryChanged', handleSearch);

        return () => {
            document.removeEventListener('searchQueryChanged', handleSearch);
        };
    }, []);

    const filteredLaptops = React.useMemo(() => {
        if (!searchQuery) {
            return allLaptops;
        }
        return allLaptops.filter(laptop => {
            const query = searchQuery.toLowerCase();
            const modelMatch = laptop.Model.toLowerCase().includes(query);

            const specs = {
                "Processor": laptop.Processor,
                "Memory": laptop.Memory,
                "Internal Drive": laptop["Internal Drive"],
                "Display": laptop.Display,
                "Graphics": laptop.Graphics,
                "Screen Part #(s)": laptop["Screen Replacement Part # (Common)"],
                "Battery Part #(s)": laptop["Battery Replacement Part # (Common)"],
                "RAM Part #(s)": laptop["RAM Replacement Part # (Common)"],
                "SSD Part #(s)": laptop["SSD Replacement Part # (Common)"]
            };

            const componentMatch = Object.values(specs)
                .some(spec => spec && spec.toLowerCase().includes(query));

            return modelMatch || componentMatch;
        });
    }, [allLaptops, searchQuery]);

    const elitebooks = filteredLaptops.filter(laptop => laptop.Model.includes('EliteBook'));
    const zbooks = filteredLaptops.filter(laptop => laptop.Model.includes('ZBook'));

    return (
        <React.Fragment>
            <h3 className="section-title">HP EliteBook</h3>
            <div id="elitebook-cards" className="card-grid">
                {elitebooks.map(laptop => <LaptopCard key={laptop.Model} laptop={laptop} />)}
            </div>
            <h3 className="section-title">HP ZBook Studio</h3>
            <div id="zbook-cards" className="card-grid">
                {zbooks.map(laptop => <LaptopCard key={laptop.Model} laptop={laptop} />)}
            </div>
            <Accessories />
        </React.Fragment>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<Laptops />);