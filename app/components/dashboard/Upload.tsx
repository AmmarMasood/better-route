import React from "react";
import { Button, Input, message, Upload } from "antd";
import * as XLSX from "xlsx";
import { BATCH_SIZE } from "@/app/contants";

function CustomUpload({ handleParsedAddresses }: any) {
  const [listValue, setListValue] = React.useState(0);
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
        if (data.length > BATCH_SIZE) {
          message.error(
            `You can upload only ${BATCH_SIZE} addresses at a time`
          );
          return;
        }

        // If the file is valid, you can continue processing the data

        const paths = data.slice(1, -1).map((item: any) => {
          return item[0];
        });

        // now divide this array of paths in to chunks of listValue

        // const chunkedPaths = [];
        // let i = 0;
        // while (i < paths.length) {
        //   chunkedPaths.push(paths.slice(i, (i += listValue)));
        // }

        // console.log("chunkedPaths", chunkedPaths);
        // console.log("data", paths);

        //  remove all undefined values
        const filteredPaths = paths.filter((path: any) => path !== undefined);
        // console.log("filteredPaths", filteredPaths);
        handleParsedAddresses(filteredPaths, listValue);
      };
      reader.readAsBinaryString(file);

      return false;
    },
  };

  return (
    <div className="bg-white border rounded-xl shadow-lg h-[500px] m-4 flex flex-col items-center justify-center">
      <div className="flex flex-col items-start mb-4">
        <span className="text-black">Enter List Value</span>
        <Input
          type="number"
          placeholder="eg 10"
          className="w-[250px]"
          onChange={(e) => {
            const value = e.target.value || "0";
            setListValue(parseInt(value, 10));
          }}
        />
      </div>
      <Upload {...props}>
        <Button type="primary" disabled={listValue <= 0}>
          Click to Upload
        </Button>
      </Upload>
    </div>
  );
}

export default CustomUpload;
