'use client';

import React from 'react';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';

import { hooks } from '../../hooks';
import { Routes } from '../../routes';
import { components } from '../../components';
import { items } from '../../items';

export const Categories: React.FC = () => {
  const searchParams = useSearchParams();
  const params = React.useMemo(() => {
    const p: Record<string, any> = { page_size: 12 };
    searchParams.forEach((value, key) => {
      p[key] = value;
    });
    return p;
  }, [searchParams]);

  const { category, categoryFetchingStatus } = hooks.useGetMenu(params);



  const renderHeader = () => {
    return (
      <components.Header
        showGoBack={true}
        title='Categories'
      />
    );
  };

  const renderContent = () => {
    if (categoryFetchingStatus) {
      return (
        <main className='scrollable container' style={{ paddingTop: 10, paddingBottom: 10 }}>
          <section style={{ marginBottom: 30 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 15,
                padding: '0 20px',
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((placeholderId) => (
                <items.SkeletonCategoryCard key={`skel-cat-${placeholderId}`} />
              ))}
            </div>
          </section>
        </main>
      );
    }

    if (!category || category.length === 0) {
      return (
        <main className='scrollable container' style={{ paddingTop: 10, paddingBottom: 10 }}>
          <section style={{ marginBottom: 30, textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#777', fontSize: '16px' }}>No categories available</p>
          </section>
        </main>
      );
    }

    return (
      <main className='scrollable container' style={{ paddingTop: 10, paddingBottom: 10 }}>
        <section style={{ marginBottom: 30 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 15,
              padding: '0 20px',
            }}
          >
            {category.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={`${Routes.MENU_LIST}/${encodeURIComponent(item.name)}?id=${item.id}`}
                  className="clickable"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '0.5rem',
                    aspectRatio: '1',
                    backgroundColor: 'var(--white-color)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '72%',
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '28%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <span
                      style={{
                        color: '#333',
                        fontWeight: 800,
                        fontSize: 'clamp(10px, 2.3vw, 12px)',
                        lineHeight: 1.08,
                        padding: '0 6px',
                        // backgroundColor: '#F0F8FF',
                      }}
                      className="number-of-lines-2"
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    );
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
    </components.Screen>
  );
};
