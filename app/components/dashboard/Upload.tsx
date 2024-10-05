import React from "react";
import { Button, message, Upload } from "antd";
import * as XLSX from "xlsx";

function CustomUpload({ handleParsedAddresses }: any) {
  const props = {
    accept: ".xlsx,.csv",
    showUploadList: false,
    beforeUpload: (file: any) => {
      const reader = new FileReader();
      reader.onload = (evt: any) => {
        /* Parse data */
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Perform your validations here
        // For example, check if the first row contains the correct headers
        const headers: any = data[0];
        if (!headers || headers[0] !== "Address") {
          message.error("Invalid file format!");
          return;
        }

        // if size is great than 10  then show error
        if (data.length > 10) {
          message.error("You can upload only 10 addresses at a time");
          return;
        }

        // If the file is valid, you can continue processing the data
        console.log("data", data);

        const paths = data.slice(1, -1).map((item: any) => {
          return item[0];
        });

        handleParsedAddresses(paths);
      };
      reader.readAsBinaryString(file);

      return false;
    },
  };

  return (
    <div className="bg-white border rounded-xl shadow-lg h-[500px] m-4 flex items-center justify-center">
      <Upload {...props}>
        <Button type="primary">Click to Upload</Button>
      </Upload>
    </div>
  );
}

export default CustomUpload;
