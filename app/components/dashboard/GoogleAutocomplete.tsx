import Autocomplete from "react-google-autocomplete";

interface IGoogleAutocomplete {
  onSelect: (place: any) => void;
  label: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  style?: any;
}

const GoogleAutocomplete = ({
  onSelect,
  label,
  placeholder = "Address",
  className,
  containerClassName,
  style,
}: IGoogleAutocomplete) => {
  return (
    <div className={`mt-8 ${containerClassName}`}>
      <label
        className={`block text-primary-black text-base font-semibold mb-1`}
      >
        {label}
      </label>
      <Autocomplete
        style={style}
        placeholder={placeholder}
        className={`text-primary-gray text-base font-medium rounded-xl p-3 border focus:border-primary-color active:border-primary-color focus:outline-none bg-secondary-color  ${className}  `}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
        onPlaceSelected={(place) => {
          onSelect(place);
        }}
        options={{
          types: ["geocode"],
          strictBounds: false,
          componentRestrictions: { country: "us" },
        }}
      />
    </div>
  );
};

export default GoogleAutocomplete;
