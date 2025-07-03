import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "firebase/auth";

type AuthState = {
    user : User | null,
    loading : boolean
}

const initialState : AuthState = {
    user : null,
    loading : true
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        setUser(state, action : PayloadAction<User | null>){
            state.user = action.payload
            state.loading = false
        },
        clearUser(state){
            state.user = null
        }
    }
})

export const {setUser, clearUser} = authSlice.actions;
export default authSlice.reducer;