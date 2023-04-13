import React from "react";
import { Box, useTheme, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, paper } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
// https://www.freecodecamp.org/news/how-to-integrate-material-ui-data-grid-in-react-using-data-from-a-rest-api/

const DataTable = ({ theadData, tbodyData }) => {
  // const DataTable = ({ data }) => {
  const theme = useTheme();

  const getHeadings = (banana) => {
    return Object.keys(banana[0]);
  };

  return (
    <Box sx={{ height: 225, width: 700, overflow: "scroll" }}>
      <table>
        <thead
          style={{
            position: "sticky",
            top: "0px",
            borderTop: "3pt solid black",
          }}
        >
          <tr>
            {theadData.map((heading) => {
              return (
                <th style={{ textAlign: "left", padding: 5 }} key={heading}>
                  {heading}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tbodyData.map((row, index) => {
            return (
              <tr key={index}>
                {theadData.map((key, index) => {
                  return (
                    <td
                      style={{
                        border: "2pt solid black",
                        textAlign: "left",
                        padding: 5,
                      }}
                      key={row[key]}
                    >
                      {row[key]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default DataTable;
