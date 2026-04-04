'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { components } from '../../../components';
import { useMenuByCatagoryStore } from '@/stores/useMenuByCatagoryStore';
import { items } from '../../../items';
import { svg } from '../../../svg';

type Props = {
  category: string;
  category_id: number;
};

export const MenuList: React.FC<Props> = ({ category, category_id }) => {
  const {
    fetchFilteredCategoryDetails,
    products,
    isLoading,
    fetchCategoryWithSearch,
    fetchNextPage,
    next,
  } = useMenuByCatagoryStore();
  const [subCategorySelected, setSubCategorySelected] = useState<number>(0);
  const [isSubcategoryEmpty, setIsSubCategoryEmpty] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchFilteredCategoryDetails(category_id, 1);
    }
  }, [fetchFilteredCategoryDetails, category_id, isClient]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const toggleFilterSection = useCallback(() => {
    setIsFilterSectionOpen((prev) => !prev);
  }, []);

  const memoizedSetSubCategorySelected = useCallback((id: number) => {
    setSubCategorySelected(id);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const delayDebounce = setTimeout(() => {
      if (search.trim().length > 0) {
        if (subCategorySelected !== 0) {
          fetchCategoryWithSearch(category_id, 1, '', search, subCategorySelected);
        } else {
          fetchCategoryWithSearch(category_id, 1, '', search);
        }
      } else {
        if (subCategorySelected === 0) {
          fetchFilteredCategoryDetails(category_id, 1);
        } else {
          fetchFilteredCategoryDetails(category_id, 1, subCategorySelected);
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, subCategorySelected, category_id, fetchCategoryWithSearch, fetchFilteredCategoryDetails, isClient]);

  const handleEndReached = () => {
    if (next) {
      fetchNextPage();
    }
  };

  const renderHeader = () => (
    <components.Header title={category} showGoBack={true} showBasket={true} />
  );

  const searchSection = useMemo(
    () => (
      <section
        className='row-center container'
        style={{
          gap: 5,
          marginTop: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <components.InputField
          inputType='search'
          placeholder='Search ...'
          containerStyle={{ flex: 1, backgroundColor: 'var(--white-color)', height: 50 }}
          value={search}
          onChange={handleSearchChange}
        />
        {!isSubcategoryEmpty && (
          <button
            onClick={toggleFilterSection}
            style={{
              width: 50,
              height: 50,
              backgroundColor: 'var(--white-color)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}
            className='center'
          >
            <svg.FilterSvg />
          </button>
        )}
      </section>
    ),
    [search, handleSearchChange, toggleFilterSection, isSubcategoryEmpty]
  );

  const filterSection = useMemo(
    () => (
      <items.FilterSubCategoryList
        category={category}
        category_id={category_id}
        isOpened={isFilterSectionOpen}
        updateCatId={memoizedSetSubCategorySelected}
        setSubCategoriesEmpty={setIsSubCategoryEmpty}
      />
    ),
    [category, category_id, isFilterSectionOpen, memoizedSetSubCategorySelected, setIsSubCategoryEmpty]
  );

  const renderDishes = () => {
    if (!isClient) {
      return (
        <section
          className='container'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px',
          }}
        >
          <span className='t16'>No items available.</span>
        </section>
      );
    }

    if (isLoading && products.length === 0) {
      return (
        <section className='container' style={{ paddingTop: 0 }}>
          {[0, 1].map((placeholderId, index, array) => (
            <items.MenuListItem
              isLoading={true}
              key={`skel-menulist-${placeholderId}`}
              isLast={index === array.length - 1}
            />
          ))}
        </section>
      );
    }

    const currentProducts = Array.isArray(products) ? products : [];
    const productsToDisplay =
      search.trim().length > 0
        ? currentProducts.filter((dish) => dish.name.toLowerCase().includes(search.toLowerCase()))
        : currentProducts;

    if (productsToDisplay.length === 0) {
      if (search.trim().length > 0) {
        return (
          <section
            className='container'
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: '20px',
            }}
          >
            <span className='t16'>No items found for "{search}"</span>
          </section>
        );
      } else {
        return (
          <section
            className='container'
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: '20px',
            }}
          >
            <span className='t16'>No items available.</span>
          </section>
        );
      }
    }

    return (
      <section>
        {productsToDisplay.map((dish, index, array) => (
          <items.MenuListItem dish={dish} key={dish.id} isLast={index === array.length - 1} />
        ))}
        {isLoading && <items.MenuListItem isLoading={true} />}
      </section>
    );
  };

  const renderContent = () => {
    const handleScroll = (event: React.UIEvent<HTMLElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        handleEndReached();
      }
    };

    return (
      <main
        className='container scrollable'
        onScroll={handleScroll}
        style={{ paddingBottom: 20, overflowY: 'auto', height: 'calc(100vh - 220px)' }}
      >
        {renderDishes()}
      </main>
    );
  };

  const renderModal = () => <components.Modal />;

  return (
    <components.Screen>
      {renderHeader()}
      {searchSection}
      {filterSection}
      {renderContent()}
      {renderModal()}
    </components.Screen>
  );
};
