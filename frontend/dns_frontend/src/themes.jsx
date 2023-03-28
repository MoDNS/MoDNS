import { createTheme } from "@mui/material";

const switch_h = 30;
const switch_w = 60;


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

const t1_on = '#8C8B72';
const t1_off = '#172121';

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
    MuiAccordion: {
      defaultProps: {
        square: true,
      },
      styleOverrides: {
        root: {
          backgroundColor: t1_p,
          '&:before': {
              display: 'none',
          },
        },
      },
    },
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          top: 0,
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        PaperProps: {
          style: {
              backgroundColor: t1_p,
              width: '125vh',
              height: '100vh',
              maxWidth: 1400,
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
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
    MuiInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: t1_tp,
          },
        },
        underline: {
          '&:after': {
            borderBottomColor: t1_tp,
          },
          '&:before': {
            borderBottomColor: t1_tp,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          backgroundColor: t1_b,
          borderRadius: 0,
        }
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'standard',
      },
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: t1_tp,
          },
        },
        underline: {
          '&:after': {
            borderBottomColor: t1_tp,
          },
          '&:before': {
            borderBottomColor: t1_tp,
          },
        },
        icon: {
          fill: t1_tp,
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
        margin: 'dense',
        size: 'small',
        color: 'text',
      },
      styleOverrides: {
        root: {
          "input::-ms-reveal": {
            display: "none",
          },
          "input::-ms-clear": {
            display: 'none',
          },
        },
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      }
    },
    MuiButton: {
      defaultProps: {
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
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: switch_w,
          height: switch_h,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            '&.Mui-checked': {
              transform: `translateX(${switch_w - (switch_h)}px)`,
              color: t1_tp,
              '& + .MuiSwitch-track': {
                backgroundColor: t1_on,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: switch_h - 4,
            height: switch_h - 4,
          },
          '& .MuiSwitch-track': {
            borderRadius: switch_w / 2,
            backgroundColor: t1_off,
            opacity: 1,
          },
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 2,
          paddingBottom: 0,
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: t1_b,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: t1_pl,
            minHeight: 24,
            border: `3px solid ${t1_b}`,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: t1_pl,
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: t1_pl,
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: t1_pl,
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: t1_p,
          },
        },
      },
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

const t2_on = '#65AB01';
const t2_off = '#40B0FF';

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
    MuiAccordion: {
      defaultProps: {
        square: true,
      },
      styleOverrides: {
        root: {
          backgroundColor: t2_p,
          '&:before': {
              display: 'none',
          },
        },
      },
    },
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          top: 0,
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        PaperProps: {
          style: {
              backgroundColor: t2_p,
              width: '125vh',
              height: '100vh',
              maxWidth: 1400,
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
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
    MuiInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: t2_tp,
          },
        },
        underline: {
          '&:after': {
            borderBottomColor: t2_tp,
          },
          '&:before': {
            borderBottomColor: t2_tp,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          backgroundColor: t2_b,
          borderRadius: 0,
        }
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'standard',
        margin: 'dense',
        size: 'small',
        color: 'text',
      },
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: t2_tp,
          },
        },
        underline: {
          '&:after': {
            borderBottomColor: t2_tp,
          },
          '&:before': {
            borderBottomColor: t2_tp,
          },
        },
        icon: {
          fill: t1_tp,
        }
      },
    },
    MuiTextField:{
      defaultProps: {
        variant: 'standard',
      },
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
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: switch_w,
          height: switch_h,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            '&.Mui-checked': {
              transform: `translateX(${switch_w - (switch_h)}px)`,
              color: t2_tp,
              '& + .MuiSwitch-track': {
                backgroundColor: t2_on,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: switch_h - 4,
            height: switch_h - 4,
          },
          '& .MuiSwitch-track': {
            borderRadius: switch_w / 2,
            backgroundColor: t2_off,
            opacity: 1,
          },
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 2,
          paddingBottom: 0,
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: t2_b,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: t2_pl,
            minHeight: 24,
            border: `3px solid ${t2_b}`,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: t2_pl,
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: t2_pl,
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: t2_pl,
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: t2_p,
          },
        },
      },
    },
  },
  spacing: 8,
})







const themes = {
  '1': themeOne,
  '2': themeTwo,
}

export default themes;