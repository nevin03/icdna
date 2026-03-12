import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type NavigationState = {
  navigationStack: string[]
  lastTabScreen: string | null
  pushToStack: (url: string) => void
  popFromStack: () => string | null
  clearStack: () => void
  setLastTabScreen: (screen: string) => void
  getLastTabScreen: () => string | null
  getCurrentUrl: () => string | null
  getPreviousUrl: () => string | null
  isTabNavigatorUrl: (url: string) => boolean
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      navigationStack: [],
      lastTabScreen: null,

      pushToStack: (url: string) => {
        set((state) => {
          console.log('🔄 Navigation: Pushing to stack:', url);
          console.log('📚 Current stack:', state.navigationStack);
          
          // Don't add the same URL consecutively
          const lastUrl = state.navigationStack[state.navigationStack.length - 1]
          if (lastUrl === url) {
            console.log('⚠️ Navigation: Skipping duplicate URL:', url);
            return state
          }
          
          // If navigating to tab-navigator, clear the stack and store the last tab screen
          if (state.isTabNavigatorUrl(url)) {
            const screenMatch = url.match(/screen=([^&]+)/)
            const screen = screenMatch ? screenMatch[1] : 'Home'
            console.log('🏠 Navigation: Tab navigator detected, clearing stack. Screen:', screen);
            return { 
              navigationStack: [url], 
              lastTabScreen: screen 
            }
          }
          
          // Limit stack size to prevent memory issues (keep last 15 URLs)
          const newStack = [...state.navigationStack, url]
          if (newStack.length > 15) {
            newStack.shift() // Remove the oldest URL
          }
          
          console.log('✅ Navigation: New stack:', newStack);
          return { navigationStack: newStack }
        })
      },

      popFromStack: () => {
        const state = get()
        console.log('⬅️ Navigation: Popping from stack. Current stack:', state.navigationStack);
        
        if (state.navigationStack.length <= 1) {
          // If only one or no URLs left, return the last tab screen or default home
          const fallbackUrl = state.lastTabScreen 
            ? `/tab-navigator?screen=${state.lastTabScreen}`
            : '/tab-navigator?screen=Home'
          console.log('🏠 Navigation: Stack empty, returning to tab screen:', fallbackUrl);
          set({ navigationStack: [] })
          return fallbackUrl
        }
        
        // Remove current URL and return the previous one
        const newStack = [...state.navigationStack]
        newStack.pop() // Remove current URL
        const previousUrl = newStack[newStack.length - 1] // Get the previous URL
        
        console.log('✅ Navigation: Returning to previous URL:', previousUrl);
        console.log('📚 Navigation: New stack after pop:', newStack);
        set({ navigationStack: newStack })
        return previousUrl
      },

      clearStack: () => {
        set({ navigationStack: [] })
      },

      setLastTabScreen: (screen: string) => {
        set({ lastTabScreen: screen })
      },

      getLastTabScreen: () => {
        const state = get()
        return state.lastTabScreen
      },

      getCurrentUrl: () => {
        const state = get()
        return state.navigationStack[state.navigationStack.length - 1] || null
      },

      getPreviousUrl: () => {
        const state = get()
        return state.navigationStack[state.navigationStack.length - 2] || null
      },

      isTabNavigatorUrl: (url: string) => {
        return url.includes('/tab-navigator')
      },
    }),
    {
      name: 'navigation-storage',
    }
  )
)
