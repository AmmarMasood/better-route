import { Button, Modal } from "antd";
import React from "react";
import GoogleAutocomplete from "./GoogleAutocomplete";

function AddAddressModal({ open, setOpen, onSubmitAddress }: any) {
  const [address, setAddress] = React.useState(
    "11 Wall St, New York, NY 10005, United States"
  );

  const handleAddAddress = () => {
    if (!address) return;
    onSubmitAddress(address);
    setOpen(false);
  };

  return (
    <Modal
      title="Add a new address"
      open={open}
      footer={false}
      onCancel={() => setOpen(false)}
    >
      <GoogleAutocomplete
        onSelect={(place: any) => setAddress(place.formatted_address)}
        className="w-full"
        label="Address"
      />
      <Button type="primary" className="mt-4" onClick={handleAddAddress}>
        Add
      </Button>
    </Modal>
  );
}

export default AddAddressModal;
