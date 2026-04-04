'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
// Import useRouter - using tracked router for navigation history
import { Swiper, SwiperSlide } from 'swiper/react';
// import PuffLoader from 'react-spinners/PuffLoader'; // No longer needed

import { items } from '../../../items';
import { hooks } from '../../../hooks';
import { Routes } from '../../../routes';
import { components } from '../../../components';
import { Autoplay, Mousewheel } from 'swiper/modules';
import { svg } from '@/svg';
// import { DishType } from '@/types';

export const Home: React.FC = React.memo(() => {
  const router = hooks.useTrackedRouter(); // Initialize tracked router for navigation history
  const [activeSlide, setActiveSlide] = useState(0);
  // const [recommendedItems, setRecommendedItems] = useState<DishType>([]);

  const { category, categoryFetchingStatus } = hooks.useGetMenu();
  const { getDishes, dishes, dishesLoading } = hooks.useGetDishes();
  const { getReviewAndRating, reviewLoading, reviews } = hooks.useReviewOrder()
  // console.log('categories :',category);
  // const {
  //   reviews, 
  //   reviewsLoading} = hooks.useGetReviews();
  const { carousel, carouselLoading } = hooks.useGetCarousel();

  // const isLoading = // This global isLoading is removed
  //   categoryFetchingStatus || dishesLoading || reviewsLoading || carouselLoading;

  useEffect(() => {
    getReviewAndRating()
    getDishes(); // Assuming getDishes also triggers fetching for other data or they are fetched independently
    // If other hooks like useGetMenu, useGetReviews, useGetCarousel need explicit fetch calls, add them here.
    // For example:
    // getCategories();
    // getReviews();
    // getCarouselData();
    // This depends on how those hooks are implemented. For now, assuming they fetch on mount or getDishes is a central fetch.
  }, [])

  const handleSlideChange = (swiper: any) => {
    // Handle loop mode: get real index instead of swiper.activeIndex for infinite loop
    const realIndex = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
    setActiveSlide(realIndex);
  };

  const renderHeader = () => {
    return (
      <components.Header
        user={true}
        title="title"
        userName={true}
        showBasket={true}
      />
    );
  };

  const renderCategories = () => {
    if (categoryFetchingStatus) {
      return (
        <section style={{ marginBottom: 30 }}>
          <components.BlockHeading
            title='We offer'
            className='container' // This className might need to be on the parent for margin/padding
            containerStyle={{ marginBottom: 14, marginLeft: 20, marginRight: 20 }} // Added margin to align with Swiper
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto', // Allows horizontal scrolling if items exceed width
              paddingLeft: '20px', // Align with Swiper's margin/padding
              paddingRight: '10px' // Ensure last item's marginRight isn't cut off
            }}
            className="swiper-substitute-scrollbar-styling" // Placeholder for potential custom scrollbar
          >
            {[0, 1, 2, 3].map((placeholderId) => (
              <items.SkeletonCategoryCard key={`skel-cat-${placeholderId}`} />
            ))}
          </div>
        </section>
      );
    }

    if (!category || category.length === 0) {
      return (
        <section style={{ marginBottom: 30 }}>
          <components.BlockHeading
            title='We offer'
            className='container'
            containerStyle={{ marginBottom: 14, marginLeft: 20, marginRight: 20 }}
          />
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <h3 style={{
              color: '#94a3b8',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>
              No categories yet
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Check back soon
            </p>
          </div>
        </section>
      );
    }

    return (
      <section style={{ marginBottom: 30 }}>
        <components.BlockHeading
          title='We offer'
          className='container'
          containerStyle={{ marginBottom: 14 }} // Original was just marginBottom: 14
        />
        <Swiper
          modules={[Mousewheel]}
          spaceBetween={10}
          slidesPerView={'auto'}
          slidesOffsetAfter={20}
          onSlideChange={() => { }}
          onSwiper={(swiper) => { }}
          className='Swiper-controller'
          style={{ height: 'fit-content', margin: '0px 20px' }}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        >
          {/* Show first 4 categories */}
          {category.slice(0, 4).map((item) => {
            return (
              <SwiperSlide key={item.id}
                style={{
                  minWidth: '120px',
                  width: 'auto',
                }}
              >
                <Link
                  href={`${Routes.MENU_LIST}/${encodeURIComponent(item.name)}?id=${item.id}`}
                  className="clickable clickable-auto-width"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '0.5rem',
                    width: '120px',
                    height: '120px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '72%',
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPositionX: 'center',
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
              </SwiperSlide>
            );
          })}

          {/* View All button if more than 4 categories */}
          {category.length > 4 && (
            <SwiperSlide
              style={{
                minWidth: '120px',
                width: 'auto',
              }}
            >
              <Link
                href={Routes.CATEGORIES}
                className="clickable clickable-auto-width"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: '0.5rem',
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#F0F8FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--main-turquoise)',
                    padding: '10px',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={28}
                    height={28}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={1.5}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{ marginBottom: 6 }}
                  >
                    <rect x={3} y={3} width={6} height={6} rx={1} />
                    <rect x={15} y={3} width={6} height={6} rx={1} />
                    <rect x={3} y={15} width={6} height={6} rx={1} />
                    <rect x={15} y={15} width={6} height={6} rx={1} />
                  </svg>
                  <span
                    style={{
                      color: 'var(--main-turquoise)',
                      fontWeight: 600,
                      fontSize: '12px',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    View All
                  </span>
                  <span
                    style={{
                      color: 'var(--main-turquoise)',
                      fontWeight: 400,
                      fontSize: '10px',
                      textAlign: 'center',
                      marginTop: 2,
                      opacity: 0.7,
                    }}
                  >
                    Categories
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          )}
        </Swiper>
      </section>
    );
  };

  const renderCarousel = () => {
    if (carouselLoading) {
      return (
        <section style={{ marginBottom: 30, position: 'relative', padding: '0 20px' }}>
          <items.SkeletonCarouselItem />
        </section>
      );
    }

    if (!carousel || carousel.length === 0) {
      return (
        <section style={{ marginBottom: 30, padding: '0 20px' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                border: '2px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '3px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    right: '3px',
                    height: '2px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '1px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '7px',
                    left: '3px',
                    width: '12px',
                    height: '2px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '1px',
                  }}
                />
              </div>
            </div>
            <h3 style={{
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              No banners yet
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.6',
              maxWidth: '280px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Check back soon for featured content and promotions
            </p>
          </div>
        </section>
      );
    }

    return (
      <section style={{ marginBottom: 30, position: 'relative' }}>
        <Swiper
          modules={[Autoplay, Mousewheel]}
          slidesPerView={'auto'}
          pagination={{ clickable: true }}
          navigation={true}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          onSlideChange={handleSlideChange}
          // className='Swiper-controller' // Already present in categories, check if needed here
          style={{ margin: '0px 20px' }} // Added margin to contain Swiper
        >
          {carousel.map((banner, index) => {
            // Ensure dishes array is available and has corresponding item for link
            const dishIdForLink = dishes && dishes[index] ? dishes[index].id : (dishes && dishes[0] ? dishes[0].id : 'fallback-id');
            return (
              <SwiperSlide key={banner.id}>
                <Link href={`${Routes.MENU_ITEM}/${dishIdForLink}`}>
                  <div 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '2/1', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={banner.image}
                      alt='Banner'
                      fill
                      priority={true}
                      className='clickable'
                      style={{ 
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1.0)';
                      }}
                    />
                  </div>
                </Link>
              </SwiperSlide>

            );
          })}
        </Swiper>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 27,
            zIndex: 1,
            width: '100%',
            gap: 6,
          }}
        >
          {carousel.map((_, index) => {
            return (
              <div
                key={_.id} // Use banner.id for key if available and unique, or index
                style={{
                  width: 8,
                  height: activeSlide === index ? 20 : 8,
                  borderRadius: 10,
                  backgroundColor:
                    activeSlide === index
                      ? 'var(--white-color)'
                      : `rgba(255, 255, 255, 0.5)`,
                }}
              />
            );
          })}
        </div>
      </section>
    );
  };

  const renderRecommendedDishes = () => {
    return (
      <section style={{ marginBottom: 30 }}>
        <components.BlockHeading
          title='Recommended for you'
          className='container'
          containerStyle={{ marginBottom: 14 }}
          href={Routes.ALL_PRODUCTS}
        />
        {dishesLoading ? (
          <ul
            style={{
              display: 'grid',
              gap: 15,
              gridTemplateColumns: 'repeat(2, 1fr)',
              margin: '0px 20px'
            }}
          >
            {[0, 1].map((placeholderKey) => (
              <items.ItemGrid
                isLoading={true}
                key={`skeleton-${placeholderKey}`}
              />
            ))}
          </ul>
        ) : !dishes || dishes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <h3 style={{
              color: '#94a3b8',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>
              No recommendations yet
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Check back soon
            </p>
          </div>
        ) : (
          <ul
            style={{
              display: 'grid',
              gap: 15,
              gridTemplateColumns: 'repeat(2, 1fr)',
              margin: '0px 20px'
            }}
          >
            {dishes.map((dish) => (
              <items.ItemGrid
                key={dish.id}
                item={dish}
              />
            ))}
          </ul>
        )}
      </section>
    );
  };

  const renderReviews = () => {
    if (reviewLoading) {
      return (
        <section style={{ marginBottom: 20 }}>
          <components.BlockHeading
            href={Routes.REVIEWS}
            title='Our Happy clients say'
            containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              paddingLeft: '20px', // Match Swiper style
              paddingRight: '6px' // (20px padding - 14px item margin)
            }}
            className="swiper-substitute-scrollbar-styling" // Placeholder for potential custom scrollbar
          >
            {/* Render 1 or 2 skeleton items. Let's use 2 for better visual representation. */}
            {[0, 1].map((placeholderId) => (
              <items.SkeletonReviewItem key={`skel-review-${placeholderId}`} />
            ))}
          </div>
        </section>
      );
    }

    if (!reviews || reviews.length === 0) {
      return (
        <section style={{ marginBottom: 20 }}>
          <components.BlockHeading
            href={Routes.REVIEWS}
            title='Our Happy clients say'
            containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
          />
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <h3 style={{
              color: '#94a3b8',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>
              No reviews yet
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Check back soon
            </p>
          </div>
        </section>
      );
    }

    return (
      <section style={{ marginBottom: 20 }}>
        <components.BlockHeading
          href={Routes.REVIEWS}
          title='Our Happy clients say'
          containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
        />
        <Swiper
          modules={[Mousewheel]}
          spaceBetween={14}
          slidesPerView={1.2} // Shows 1 full item and part of the next
          pagination={{ clickable: true }}
          navigation={true} // Consider if navigation arrows are desired/styled
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          style={{ padding: '0 20px' }} // Swiper itself has padding for items to peek
        >
          {reviews.map((review: any) => { // Added type for review if available, e.g. ReviewType
            return (
              <SwiperSlide key={review.id}>
                <items.ReviewItem
                  review={review}
                  truncateText={true}
                  onCardClick={() => router.push(`${Routes.REVIEWS}#review-${review.id}`)}
                  showMoreButton={false} // Explicitly false for home screen
                  showViewButton={true}   // Show "View" button on home screen
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>
    );
  };

  const renderSearchSection = () => {
    const handleSearchClick = () => {
      // Navigate to MenuView and focus search
      router.push('/tab-navigator?screen=Menu&focus=search');
    };

    return (
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
        <div
          onClick={handleSearchClick}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            borderRadius: 10,
            padding: '5px 0px 5px 5px',
            backgroundColor: 'var(--white-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <svg.SearchSvg />
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              margin: 0,
              border: 'none',
              outline: 'none',
              backgroundColor: 'var(--white-color)',
              // border: '1px solid #E5E7EB',
              // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              fontSize: 16,
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              minHeight: '40px',
            }}
          >
            Search ...
          </div>
          <div style={{ padding: '10px 19px' }} />
        </div>
      </section>
    );
  };

  const renderContent = () => {
    // if (isLoading) return null; // Removed global loading check
    return (
      <main
        className='scrollable'
        style={{ paddingTop: 10, paddingBottom: 70, height: '100%' }} // Added paddingBottom for tab bar
      >
        {renderSearchSection()}
        {renderCarousel()}
        {renderCategories()}
        {renderRecommendedDishes()}
        {renderReviews()}
      </main>
    );
  };

  // const renderLoader = () => { // renderLoader is no longer needed
  //   if (!isLoading) return null;

  //   return (
  //     <div
  //       style={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         position: 'absolute',
  //         inset: 0,
  //         height: '100%',
  //       }}
  //       className='flex-center'
  //     >
  //       <PuffLoader
  //         size={40}
  //         color={'#455A81'}
  //         aria-label='Loading Spinner'
  //         data-testid='loader'
  //         speedMultiplier={1}
  //       />
  //     </div>
  //   );
  // };

  const renderModal = () => {
    return <components.Modal />;
  };

  const renderBottomTabBar = () => {
    return <components.BottomTabBar />;
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
      {renderModal()}
      {/* {renderLoader()} PuffLoader is removed */}
      {renderBottomTabBar()} {/* Ensures BottomTabBar is always rendered */}
    </components.Screen>
  );
});
