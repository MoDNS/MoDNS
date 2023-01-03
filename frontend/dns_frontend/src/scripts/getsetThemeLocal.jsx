
export const getThemeStorage = () => {
    var stored_theme = localStorage.getItem('theme');
    if (stored_theme) {
        return stored_theme;
    }
    return '1';
}

export const setThemeStroage = (theme) => {
    localStorage.setItem('theme', theme);
}