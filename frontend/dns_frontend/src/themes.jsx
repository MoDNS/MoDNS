import { createTheme } from "@mui/material";

/////////////////////////////////////////////// THEME ONE ///////////////////////////////////////////////
const t1_p = '#444554';
const t1_pl = '#5B5C70';
const t1_pd = '#2D2E38';

const t1_s = '#545344';
const t1_sl = '#706F5B';
const t1_sd = '#38372D';

const t1_b = '#172121';

const t1_tp = '#e8efef';
const t1_ts = '#cadada';

const t1_l = '#a9a6c5';

const themeOne = createTheme({
  palette: {
    primary: {
      main: t1_p,
      light: t1_pl,
      dark: t1_pd,
    },
    secondary: {
      main: t1_s,
      light: t1_sl,
      dark: t1_sd,
    },
    background: {
      default: t1_b,
    },
    text: {
      primary: t1_tp,
      secondary: t1_ts,
    },
    link: {
      main: t1_l,
    },
    info: {
      main: t1_l,
    },
    divider: t1_tp,
  },
  components: {
    // Name of the component
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: t1_p,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: t1_pd,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: t1_tp,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          color: t1_tp,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "input::-ms-reveal": {
            display: "none",
          },
          "input::-ms-clear": {
            display: 'none',
          },
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        noWrap: true,
      },
      styleOverrides: {
        root: {
          color: t1_tp,
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
      styleOverrides: {
        // Name of the slot
        root: {
          "&.MuiButton-contained": {
            // Some CSS
            backgroundColor: t1_s,
            '&:hover': {
              backgroundColor:t1_sl,
            }
          },
          "&.MuiButton-text": {
            textTransform: 'none',
            
            padding: 0,
            textDecoration:'underline',
            color: t1_tp,
            '&:hover': {
              textDecoration:'underline 1.5px'
            },
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: t1_tp,
          '&.Mui-checked': {
            color: t1_tp,
          }
        }
      }
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


/////////////////////////////////////////////// THEME TWO ///////////////////////////////////////////////
const t2_p = '#014778';
const t2_pl = '#0165AB';
const t2_pd = '#012945';

const t2_s = '#783201';
const t2_sl = '#AB4701';
const t2_sd = '#461D01';

const t2_b = '#d9efff';

const t2_tp = '#ffffff';
const t2_ts = '#E6E6E6';

const t2_l = '#02AA9B';

const themeTwo = createTheme({
  palette: {
    primary: {
      main: t2_p,
      light: t2_pl,
      dark: t2_pd,
    },
    secondary: {
      main: t2_s,
      light: t2_sl,
      dark: t2_sd,
    },
    background: {
      default: t2_b,
    },
    text: {
      primary: t2_tp,
      secondary: t2_ts,
    },
    link: {
      main: t2_l,
    },
    info: {
      main: t2_l,
    },
    divider: t2_tp,
  },
  components: {
    // Name of the component
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: t2_p,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: t2_pd,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: t2_tp,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          color: t2_tp,
        },
      },
    },
    MuiTextField:{
      styleOverrides: {
        root: {
          "input::-ms-reveal": {
            display: "none",
          },
          "input::-ms-clear": {
            display: 'none',
          },
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        noWrap: true,
      },
      styleOverrides: {
        root: {
          color: t2_tp,
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true,
      },
      styleOverrides: {
        // Name of the slot
        root: {
          "&.MuiButton-contained": {
            // Some CSS
            backgroundColor: t2_s,
            '&:hover': {
              backgroundColor:t2_sl,
            }
          },
          "&.MuiButton-text": {
            textTransform: 'none',
            
            padding: 0,
            textDecoration:'underline',
            color: t2_tp,
            '&:hover': {
              textDecoration:'underline 1.5px'
            },
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: t2_tp,
          '&.Mui-checked': {
            color: t2_tp,
          }
        }
      }
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


const themes = {
  '1': themeOne,
  '2': themeTwo,
}

export default themes;