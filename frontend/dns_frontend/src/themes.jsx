// const theme2 = {
//   primary: '#014778',
//   secondary: '#783201',
//   secondary_light: '#AB4701',
//   background: '#ffffff',
//   link: '#d9efff',
//   alt: '#0211AA',
//   text: '#d9efff'
// };


import { createTheme } from "@mui/material";

export const themeOne = createTheme({
  palette: {
    primary: {
      main: '#444554',
      light: '#6f7080',
      dark: '#1d1e2b',
    },
    secondary: {
      main: '#545344',
      light: '#817f6f',
      dark: '#2b2b1d',
    },
    background: {
      default: '#172121',
    },
    text: {
      primary: '#e8efef',
      secondary: '#ACC5C5',
    },
    link: {
      main: '#a9a6c5',
    },
    info: {
      main: '#a9a6c5',
    },
    divider: '#e8efef',
  },
  components: {
    // Name of the component
    MuiTextField:{
      styleOverrides: {
        root: {
          "input::-ms-reveal": {
            display: "none",
          },
          "input::-ms-clear": {
            display: 'none',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          "&.MuiButton-contained": {
            // Some CSS
            backgroundColor: '#545344',
            '&:hover': {
              backgroundColor:'#817f6f',
            }
          },
          "&.MuiButton-text": {
            textTransform: 'none',
            padding: 0,
            textDecoration:'underline',
            color: '#e8efef',
            '&:hover': {
              textDecoration:'underline 1.5px'
            },
          },
        },
      },
    },
  },
  props: {
    MuiTextField: {
      margin: 'dense',
      size: 'small',
      color: 'text',
    },
  },
  spacing: 8,
})