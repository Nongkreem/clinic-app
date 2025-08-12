// frontend/src/components/common/ServiceDropdown.jsx
import React from 'react';

const ServiceDropdown = ({ options, value, onChange, className, disabled, defaultOptionText = "-- เลือกบริการ --" }) => {

    const handleSelectChange = (event) => {
        const selectedId = parseInt(event.target.value, 10);
        const selectedService = options.find(service => service.service_id === selectedId);
        if (onChange && selectedService) {
            onChange(selectedService); // Pass the full service object
        }
    };

    return (
        <select
            value={value || ''}
            onChange={handleSelectChange}
            className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stromboli-300 focus:border-transparent transition duration-200  ${className || ''}`}
            disabled={disabled}
            required
        >
            <option value="" disabled hidden>{defaultOptionText}</option>
            {options.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                    {service.service_name}
                </option>
            ))}
        </select>
    );
};

export default ServiceDropdown;
