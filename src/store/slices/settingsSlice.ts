import {createSlice} from "@reduxjs/toolkit";

interface SettingsState {
  darkMode: boolean;
}

const getInitialState = (): SettingsState => {
  const storedDarkMode = localStorage.getItem("darkMode");
  return {
    darkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
  };
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: getInitialState(),
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
  },
});

export const {toggleDarkMode} = settingsSlice.actions;
export default settingsSlice.reducer;
