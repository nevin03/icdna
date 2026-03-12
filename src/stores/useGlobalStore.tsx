import { create } from "zustand";

export type GlobalStateType = {
    isFirstTime : boolean
    updateFirstTimeVisitFlag : () => void
    resetGlobalState : () => void
}

const initialState: Omit<
    GlobalStateType,
    'updateFirstTimeVisitFlag' | 'resetGlobalState'
> = {
    isFirstTime : true
}

export const useGlobalStore = create<GlobalStateType>(
    (set)=>({
        ...initialState,
        updateFirstTimeVisitFlag: () => set({isFirstTime:false}),
        resetGlobalState: () => set({isFirstTime:true}),
    })
)
