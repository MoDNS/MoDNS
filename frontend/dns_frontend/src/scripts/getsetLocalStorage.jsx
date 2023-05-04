import { DASHBOARD_SOURCE_KEY, THEME_KEY } from "../Constants";

/////////////////////////////// THEME ///////////////////////////////
export const getThemeStorage = () => {
    var stored_theme = localStorage.getItem(THEME_KEY);
    if (stored_theme) {
        return stored_theme;
    }
    return '1';
}

export const setThemeStorage = (theme) => {
    localStorage.setItem(THEME_KEY, theme);
}


//////////////////////////// PLUGIN VIEW ////////////////////////////
export const getPluginViewStorage = () => {
    var stored_view = localStorage.getItem('pluginView');
    if (stored_view) {
        return stored_view;
    }
    return 's';
}

export const setPluginViewStorage = (view) => {
    localStorage.setItem('pluginView', view);
}

//////////////////////////// LOCAL DASHBOARD ////////////////////////////
export const getDashboardLayout = () => {
    var dashboard_layout = localStorage.getItem('dashboardLayout');
    if (dashboard_layout) {
        return JSON.parse(dashboard_layout);
    } else {
        return [];
    }
}

export const setDashboardLayout = (layout) => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
}

export const getDashboardSource = () => {
    var dashboard_source = localStorage.getItem(DASHBOARD_SOURCE_KEY);
    if (dashboard_source) {
        return dashboard_source;
    } else {
        return 'g';
    }
}

export const setDashboardSource = (use) => {
    localStorage.setItem(DASHBOARD_SOURCE_KEY, use);
}