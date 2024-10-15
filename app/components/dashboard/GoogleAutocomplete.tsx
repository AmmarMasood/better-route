import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { useLoadScript } from '@react-google-maps/api';

interface IGoogleAutocomplete {
  onSelect: (place: any) => void;
  label: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
}

const GoogleAutocomplete: React.FC<IGoogleAutocomplete> = ({
  onSelect,
  label,
  placeholder = "Address",
  className,
  containerClassName,
  style,
}) => {
  // const [inputValue, setInputValue] = useState('');
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDMgMuIJ3Rv3Yt7OY75hDBuExkuicasaQU",
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded && !loadError && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById('google-autocomplete') as HTMLInputElement,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'us' },
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onSelect(place);
      });
    }
  }, [isLoaded, loadError, onSelect]);

  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`mt-8 ${containerClassName}`}>
      <label className="block text-primary-black text-base font-semibold mb-1">
        {label}
      </label>
      <input
        id="google-autocomplete"
        type="text"
        onChange={(e) => onSelect(e)}
        placeholder={placeholder}
        style={style}
        className={`text-primary-gray text-base font-medium rounded-xl p-3 border focus:border-primary-color active:border-primary-color focus:outline-none bg-secondary-color ${className}`}
      />
    </div>
  );
};

export default GoogleAutocomplete;