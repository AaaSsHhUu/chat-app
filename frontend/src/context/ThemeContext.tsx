import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{theme : string, toggleTheme : () => void}>({
    theme : "light",
    toggleTheme : () => {}
})

export const ThemeProvider = ({children} : {children : React.ReactNode}) => {
    const [theme, setTheme] = useState<string>(
        () => localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        localStorage.setItem("theme", theme)
    },[theme])

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext);