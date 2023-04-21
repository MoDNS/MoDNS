import React from "react";
import { PropTypes } from 'prop-types';
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { Typography } from "@mui/material";
// https://www.freecodecamp.org/news/how-to-integrate-material-ui-data-grid-in-react-using-data-from-a-rest-api/

const DataTable = ({ label, data, height }) => {

  const theme = useTheme();

  let theHeaders = data.headers || [];
  let theData = data.data || [];
  if (theData[0] && !('id' in theData[0]) ) {
    theHeaders.splice(0, 0, {
      field: 'id',
      headerName: 'ID',
      width: 20,
    });
    
    theData.forEach((element, index) => {
      let newEl = {...element}
      newEl["id"] = index;
      theData[index] = newEl;
    });
  }

  return (
    <div style={{ direction: 'column', width: '100%', }}>
      <Typography
        fontSize={24}
        
      >
        {label}
      </Typography>
      <div style={{ height: height, width: '100%', paddingBottom: 10, paddingRight: 10 }} >
        <DataGrid
          componentsProps={{
            columnMenu: {
              sx: {
                  /* style allied to the column menu */
                  backgroundColor: theme.palette.secondary.main,
                }
            },
            filterPanel: {
              sx: {
                backgroundColor: theme.palette.secondary.main
              }
            }
          }}
          sx={{ marginRight: 2, width: '100%' }}
          columns={theHeaders}
          rows={theData}
          disableRowSelectionOnClick
          disableColumnSelector
        />
      </div>
    </div>
  );
};

export default DataTable;


DataTable.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

DataTable.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};