'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { svg } from '../svg';
import { stores } from '../stores';
import { TabScreens, Routes } from '../routes';
import { useAuth } from './AuthProvider';
import { requireAuth } from '../utils/authUtils';

const tabs = [
  {
    id: 1,
    name: TabScreens.HOME,
    icon: svg.HomeTabSvg,
  },
  {
    id: 2,
    name: TabScreens.MENU,
    icon: svg.SearchTabSvg,
  },
  {
    id: 3,
    name: TabScreens.ORDER,
    icon: svg.OrderTabSvg,
  },
  {
    id: 4,
    name: TabScreens.FAVORITE,
    icon: svg.HeartTabSvg,
  },
  {
    id: 5,
    name: TabScreens.NOTIFICATIONS,
    icon: svg.BellTabSvg,
  },
];

export const BottomTabBar: React.FC = () => {
  const { screen, setScreen } = stores.useTabStore();
  const router = useRouter();
  const { openAuthModal } = useAuth();

  const handleTabClick = (tabName: string) => {
    // Check if user needs authentication for ORDER and FAVORITE tabs
    if ((tabName === TabScreens.ORDER || tabName === TabScreens.FAVORITE)) {
      const targetRoute = `${Routes.TAB_NAVIGATOR}?screen=${tabName}`;
      if (!requireAuth(openAuthModal, targetRoute)) {
        return; // User will see auth modal and redirect after authentication
      }
    }

    setScreen(tabName);
    router.push(`${Routes.TAB_NAVIGATOR}?screen=${tabName}`);
  };

  return (
    <section className='container'>
      <nav style={{ marginBottom: 10, marginTop: 10 }}>
        <ul
          style={{
            display: 'flex',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: 'var(--white-color)',
          }}
        >
          {tabs.map((tab) => {
            return (
              <li
                key={tab.id}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: 15,
                  paddingBottom: 15,
                }}
                className='clickable'
                onClick={() => handleTabClick(tab.name)}
              >
                <tab.icon
                  fillColor={
                    screen === tab.name
                      ? 'var(--main-color)'
                      : 'var(--text-color)'
                  }
                  strokeColor={
                    screen === tab.name
                      ? 'var(--main-color)'
                      : 'var(--text-color)'
                  }
                />
                <span
                  style={{
                    fontSize: 9,
                    marginTop: 3,
                    color:
                      screen === tab.name
                        ? 'var(--main-color)'
                        : 'var(--text-color)',
                  }}
                >
                  {tab.name}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
};
