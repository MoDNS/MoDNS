
/////////////////////////////// THEME ///////////////////////////////
export const getThemeStorage = () => {
    var stored_theme = localStorage.getItem('theme');
    if (stored_theme) {
        return stored_theme;
    }
    return '1';
}

export const setThemeStorage = (theme) => {
    localStorage.setItem('theme', theme);
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
        console.log()
        return JSON.parse(dashboard_layout);
    } else {
        return [];
    }
}

export const setDashboardLayout = (layout) => {
    console.log(JSON.stringify(layout));
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
}