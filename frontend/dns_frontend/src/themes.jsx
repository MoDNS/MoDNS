
// const theme1 = {
//     primary: '#444554',
//     secondary: '#545344',
//     secondary_light: '#706F5B',
//     background: '#172121',
//     link: '#a9a6c5',
//     alt: '#9b8491',
//     text: '#e8efef'
// };

// const theme2 = {
//   primary: '#014778',
//   secondary: '#783201',
//   secondary_light: '#AB4701',
//   background: '#ffffff',
//   link: '#d9efff',
//   alt: '#0211AA',
//   text: '#d9efff'
// };


// const themes = {
//   theme1,
//   theme2
// }

// export default themes;


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
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          backgroundColor: '#545344',
          '&:hover': {
            backgroundColor:'#817f6f',
          }
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