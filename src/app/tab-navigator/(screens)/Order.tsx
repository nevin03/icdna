'use client';

import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Cookies from 'js-cookie';

import { svg } from '../../../svg';
import { items } from '../../../items';
import { stores } from '../../../stores';
import { Routes } from '../../../routes';
import { components } from '../../../components';
import { useRouter } from 'next/navigation';
// import { Coupon } from '@/types/CartDataType'; // Commented for future use

export const Order: React.FC = React.memo(() => {
  const { discount, applyWalletAmount, removeWalletAmount, orderType, delivery, total, subtotal, updatePreOrderDetails, updateOrderType, fetchCart, walletAmount, /*coupons,*/ selectedCoupon, applyOrRemoveCoupon, isApplyingCoupon, getOrderedCartItems, couponDiscount } = stores.useCartStore();
  const { amount } = stores.useWalletStore()
  // const [isCouponPopupOpen, setCouponPopupOpen] = React.useState(false); // Commented for future use
  const [promoCodeInput, setPromoCodeInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  const router = useRouter()

  React.useEffect(() => {
    setPromoCodeInput(selectedCoupon?.code || '');
    setCouponError('');
  }, [selectedCoupon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPromoCodeInput(newValue);
    setCouponError('');
  };

  const handleApplyClick = async () => {
    if (!promoCodeInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    /* Commented as we now allow direct entry
    // Check if coupon exists in the list
    const couponExists = coupons.some(c =>
      c.code.toLowerCase() === promoCodeInput.toLowerCase() &&
      c.is_valid &&
      c.public_display
    );

    if (!couponExists) {
      setCouponError('Invalid coupon code');
      return;
    }
    */

    // Check if it's already applied
    if (selectedCoupon?.code.toLowerCase() === promoCodeInput.toLowerCase()) {
      setCouponError('Coupon is already applied');
      return;
    }

    /* Commented as we now allow direct entry
    // Find the matching coupon to get its id
    const matchedCoupon = coupons.find(c =>
      c.code.toLowerCase() === promoCodeInput.toLowerCase() &&
      c.is_valid &&
      c.public_display
    );

    if (!matchedCoupon) {
      setCouponError('Invalid coupon code');
      return;
    }

    const success = await applyOrRemoveCoupon({ code: matchedCoupon.code });
    */
    const success = await applyOrRemoveCoupon({ code: promoCodeInput.trim() });

    if (success) {
      // Fetch cart again to get updated data
      await fetchCart();
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code or failed to apply. Please try again.');
    }
  };

  const handleRemoveClick = async () => {
    const success = await applyOrRemoveCoupon({ action: 'remove' });
    if (success) {
      // Fetch cart again to get updated data
      await fetchCart();
      setPromoCodeInput('');
      setCouponError('');
    }
  };

  /* Commented for future use
  const handleSelectCoupon = async (coupon: Coupon) => {
    if (selectedCoupon?.code === coupon.code) {
      // Tapping applied coupon immediately removes it
      const success = await applyOrRemoveCoupon({ action: 'remove' });
      if (success) {
        await fetchCart();
        setPromoCodeInput('');
        setCouponError('');
      }
    } else {
      // Apply the selected coupon
      const success = await applyOrRemoveCoupon({ code: coupon.code });
      if (success) {
        await fetchCart();
        setPromoCodeInput(coupon.code);
        setCouponError('');
      }
    }
    setCouponPopupOpen(false);
  };
  */

  // Authentication check function (same as TabNavigator)
  const isAuthenticated = () => !!Cookies.get('authToken');

  // Fetch cart when Order screen is reached (replicating TabNavigator pattern)
  useEffect(() => {
    const auth = isAuthenticated();
    if (auth) {
      fetchCart(); // Call fetchCart API when Order screen loads
    }
  }, []); // Empty dependency array means this runs once when component mounts

  // Quantity validation logic
  const validateCartQuantities = () => {
    const orderedCartItems = getOrderedCartItems();
    if (orderedCartItems.length === 0) return { isValid: true, invalidItems: [] };

    const invalidItems: any[] = [];

    orderedCartItems.forEach((cartItem) => {
      // Find the actual variant from product.variants by matching variant.id
      const actualVariant = cartItem.product.variants.find(
        (variant) => variant.id === cartItem.variant.id
      );

      if (actualVariant) {
        // Compare cart quantity with actual available quantity
        if (cartItem.quantity > actualVariant.quantity) {
          invalidItems.push({
            cartItem,
            actualQuantity: actualVariant.quantity,
            cartQuantity: cartItem.quantity
          });
        }
      }
    });

    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  };

  const { isValid: isCartValid } = validateCartQuantities();

  // const [orderType, setOrderType] = React.useState<'Instant' | 'Pre-Order'>('Instant');
  const [preOrderDate, setPreOrderDate] = React.useState<Date | null>(null);
  const [preOrderTime, setPreOrderTime] = React.useState<Date | null>(null);
  // console.log('orderType :',orderType);
  // console.log('pre-orrder date :',preOrderDate?.toISOString().split('T')[0]);
  // console.log('preOrderTime :',preOrderTime?.toTimeString().slice(0, 5));

  // Pre-order validation logic
  const validatePreOrder = () => {
    if (orderType === 'Instant') {
      return { isValid: true, error: null };
    }

    // For Pre-Order, both date and time are required
    if (!preOrderDate) {
      return { isValid: false, error: 'Please select a date for your pre-order' };
    }

    if (!preOrderTime) {
      return { isValid: false, error: 'Please select a time for your pre-order' };
    }

    const today = new Date();
    const selectedDate = new Date(preOrderDate);

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Date should not be less than today
    if (selectedDate < today) {
      return { isValid: false, error: 'Pre-order date cannot be in the past' };
    }

    // If selected date is today, check time validation
    if (selectedDate.getTime() === today.getTime()) {
      const currentTime = new Date();
      const selectedDateTime = new Date(preOrderDate);

      // Set the selected time to the selected date
      selectedDateTime.setHours(preOrderTime.getHours());
      selectedDateTime.setMinutes(preOrderTime.getMinutes());

      // Time should not be less than current time if date is today
      if (selectedDateTime <= currentTime) {
        return { isValid: false, error: 'Pre-order time must be later than current time for today' };
      }
    }

    return { isValid: true, error: null };
  };

  const preOrderValidation = validatePreOrder();
  const isCheckoutDisabled = !isCartValid || !preOrderValidation.isValid;

  const handleCheckout = () => {
    // Double-check validation before proceeding
    if (isCheckoutDisabled) {
      return;
    }

    setCheckoutLoading(true);
    updatePreOrderDetails(preOrderDate?.toISOString().split('T')[0], preOrderTime?.toTimeString().slice(0, 5))
    router.push(Routes.CHECKOUT)
  }


  // Use wallet state from cart store instead of local state
  const isWalletApplied = walletAmount > 0;

  const handleApplyWalletAmount = () => {
    if (isWalletApplied) {
      removeWalletAmount();
    } else {
      applyWalletAmount(parseFloat(amount));
    }
  }

  const renderHeader = () => {
    return (
      <components.Header
        user={true}
        title='Order'
        showBasket={true}
        userName
      />
    );
  };

  const renderContent = () => {
    return (
      <main
        className='scrollable container'
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        {/* DISHES */}
        <section style={{ marginBottom: 20 }}>
          <ul>
            {getOrderedCartItems().map((dish, index, array) => {
              const isLast = index === array.length - 1;
              return (
                <items.OrderItem
                  dish={dish}
                  key={dish.id}
                  isLast={isLast}
                />
              );
            })}
          </ul>
        </section>

        {/* Commented for future use
        <components.CouponPopup
          isOpen={isCouponPopupOpen}
          onClose={() => setCouponPopupOpen(false)}
          coupons={coupons}
          appliedCoupon={selectedCoupon}
          onSelectCoupon={handleSelectCoupon}
        />
        */}
        {/* PROMOCODE SECTION */}
        <section style={{ marginBottom: 35 }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--main-dark)' }}>Promocode</h4>

          {/* Modern Promocode Container */}
          <div style={{
            border: `2px solid ${selectedCoupon ? 'var(--main-turquoise)' : '#e1f0f5'}`,
            borderRadius: '16px',
            padding: '20px',
            position: 'relative'
          }}>

            <div style={{ gap: 12, alignItems: 'flex-start' }}>
              <div
                className="coupon-apply-container"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {/* Input Container */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    // border: `2px solid ${couponError ? '#ff6b6b' : selectedCoupon ? 'var(--main-turquoise)' : '#e1f0f5'}`,
                    padding: '12px 12px',
                    gap: '18px',
                    // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selectedCoupon ? 'var(--main-turquoise)' : '#e1f0f5',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      color: `${couponError ? '#ff6b6b' : '#4fd1c7'}`
                    }}>
                      {selectedCoupon ? (
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                      ) : (
                        <svg.TagSvg />
                      )}
                    </div>
                    <input
                      type='text'
                      placeholder='Enter promocode'
                      value={promoCodeInput}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--main-dark)',
                        background: 'transparent',
                        letterSpacing: '1px'
                      }}
                    />
                    {promoCodeInput && (
                      <button
                        onClick={() => {
                          setPromoCodeInput('');
                          setCouponError('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          // padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999'
                        }}
                      >
                        x
                      </button>
                    )}
                  </div>

                  {/* Error Message */}
                  {couponError && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#fff5f5',
                      border: '1px solid #ffcccb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '14px' }}>⚠️</span>
                      <span style={{ fontSize: '12px', color: '#d63031', fontWeight: '500' }}>
                        {couponError}
                      </span>
                    </div>
                  )}

                  {/* Success Message */}
                  {selectedCoupon && !couponError && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#f0fff4',
                      border: '1px solid #9ae6b4',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '14px' }}>🎉</span>
                      <span style={{ fontSize: '12px', color: '#38a169', fontWeight: '500' }}>
                        Coupon applied successfully! You saved ₹{couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* View Coupons Button Container */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end', /* Alignment changed to flex-end because view button is disabled */
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '0.5rem'
                }}
              >
                {/* Commented for future use
                <button
                  onClick={() => setCouponPopupOpen(true)}
                  style={{
                    background: 'var(--main-turquoise)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '12px',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 209, 199, 0.3)',
                    transition: 'all 0.2s ease',
                    // marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  className='clickable'
                >
                  View Available Coupons
                </button>
                */}
                {/* Action Buttons */}
                <div className="coupon-action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!selectedCoupon || promoCodeInput.toLowerCase() !== selectedCoupon.code?.toLowerCase() ? (
                    <button
                      onClick={handleApplyClick}
                      disabled={isApplyingCoupon || !promoCodeInput.trim()}
                      style={{
                        background: isApplyingCoupon || !promoCodeInput.trim()
                          ? '#cccccc'
                          : ' var(--main-turquoise)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isApplyingCoupon || !promoCodeInput.trim() ? 'not-allowed' : 'pointer',
                        boxShadow: isApplyingCoupon || !promoCodeInput.trim()
                          ? 'none'
                          : '0 4px 12px rgba(79, 209, 199, 0.3)',
                        transition: 'all 0.2s ease',
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      className='clickable'
                    >
                      {isApplyingCoupon ? (
                        <>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid white',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Applying
                        </>
                      ) : (
                        <>
                          Apply
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleRemoveClick}
                      disabled={isApplyingCoupon}
                      style={{
                        background: isApplyingCoupon ? '#cccccc' : '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isApplyingCoupon ? 'not-allowed' : 'pointer',
                        boxShadow: isApplyingCoupon ? 'none' : '0 4px 12px rgba(255, 107, 107, 0.3)',
                        transition: 'all 0.2s ease',
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      className='clickable'
                    >
                      {isApplyingCoupon ? (
                        <>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid white',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Removing
                        </>
                      ) : (
                        <>
                          Remove
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TYPE OF ORDER */}
        <section style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 15 }}>Order Type</h4>
          <components.ModernToggleSwitch
            options={[
              { label: 'Instant', value: 'Instant' },
              { label: 'Pre-order', value: 'Pre-Order' },
            ]}

            value={orderType}
            onChange={(value) => updateOrderType(value as 'Instant' | 'Pre-Order')}
            className="order-type-segment"
          />
          <p className='t12' style={{ color: '#000', marginTop: 10 }}>
            {orderType === 'Instant'
              ? 'Your order will be prepared and delivered as soon as possible.'
              : 'Schedule your order for a future date and time.'}
          </p>
          {orderType === 'Pre-Order' && (
            <div
              className="datepicker-container"
              style={{
                marginTop: 20,
                display: 'flex',
                gap: 15,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <h5 style={{ marginBottom: 8, color: 'var(--main-dark)' }}>Select Date</h5>
                <DatePicker
                  selected={preOrderDate}
                  onChange={(date) => setPreOrderDate(date)}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                  className="custom-datepicker-input"
                  minDate={new Date()}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h5 style={{ marginBottom: 8, color: 'var(--main-dark)' }}>Select Time</h5>
                <DatePicker
                  selected={preOrderTime}
                  onChange={(time) => setPreOrderTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select a time"
                  className="custom-datepicker-input"
                />
              </div>
            </div>
          )}
        </section>

        {/* SUMMARY */}
        <section style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: 20,
              borderRadius: 10,
              border: '1px solid var(--main-turquoise)',
            }}
          >
            <ul>
              {/* SUBTOTAL */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span
                  className='t14'
                  style={{ color: 'var(--main-dark)', fontWeight: 500 }}
                >
                  Subtotal
                </span>
                <span
                  className='t14'
                  style={{ color: 'var(--main-dark)' }}
                >
                  ₹{parseFloat(subtotal.toString()).toFixed(2)}
                </span>
              </li>
              {/* DISCOUNT */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span className='t14'>Discount</span>
                <span className='t14' style={{ color: 'var(--main-turquoise)' }}>-₹{parseFloat(discount.toString()).toFixed(2)}</span>
              </li>
              {/* COUPON DISCOUNT */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span className='t14'>Coupon Discount</span>
                <span className='t14' style={{ color: 'var(--main-turquoise)' }}>-₹{parseFloat(couponDiscount.toString()).toFixed(2)}</span>
              </li>
              {/* DELIVERY */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span className='t14'>Delivery</span>
                <span className='t14'>₹{delivery}</span>
              </li>
              {/* WALLET */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg.WalletSvg color="var(--main-turquoise)" size={18} />
                  <span className='t14' style={{ fontWeight: 500 }}>Wallet</span>
                  <span className='t12' style={{ color: '#666' }}>(Bal: ₹{amount})</span>
                </div>
                {isWalletApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className='t14' style={{ color: 'var(--main-turquoise)', fontWeight: 600 }}>-₹{walletAmount.toFixed(2)}</span>
                    <button
                      onClick={removeWalletAmount}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff6b6b',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleApplyWalletAmount}
                    disabled={parseFloat(amount) <= 0}
                    style={{
                      background: parseFloat(amount) <= 0 ? '#eee' : 'var(--main-turquoise)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Apply
                  </button>
                )}
              </li>
              <li style={{ marginBottom: 15, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => router.push(Routes.TOPUP_WALLET)}
                  className='t12'
                  style={{ color: 'var(--main-turquoise)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Top up wallet
                </button>
              </li>
              <div style={{ borderTop: '1px solid #DBE9F5', marginBottom: 15 }}></div>
              {/* TOTAL */}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h4>Total</h4>
                <h4>₹{parseFloat(total.toString()).toFixed(2)}</h4>
              </li>
            </ul>
          </div>
        </section>

        {/* QUANTITY VALIDATION MESSAGE */}
        {!isCartValid && (
          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FEB2B2',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '20px' }}>⚠️</div>
              <div>
                <h5 style={{
                  margin: '0 0 4px 0',
                  color: '#C53030',
                  fontSize: '14px',
                  fontWeight: 'var(--fw-semibold)'
                }}>
                  Quantity Exceeded
                </h5>
                <p style={{
                  margin: 0,
                  color: '#C53030',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  Some items in your cart exceed available stock. Please adjust quantities to proceed.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PRE-ORDER VALIDATION MESSAGE */}
        {!preOrderValidation.isValid && (
          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FEB2B2',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '20px' }}>🕒</div>
              <div>
                <h5 style={{
                  margin: '0 0 4px 0',
                  color: '#C53030',
                  fontSize: '14px',
                  fontWeight: 'var(--fw-semibold)'
                }}>
                  Pre-Order Required
                </h5>
                <p style={{
                  margin: 0,
                  color: '#C53030',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {preOrderValidation.error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* BUTTON */}
        <section>
          <components.Button
            label='Checkout'
            loading={checkoutLoading}
            loadingLabel='Loading...'
            onClick={!isCheckoutDisabled ? handleCheckout : () => { }}
            className={!isCheckoutDisabled ? "moving-gradient-btn" : ""}
            style={{
              opacity: !isCheckoutDisabled ? 1 : 0.5,
              cursor: !isCheckoutDisabled ? 'pointer' : 'not-allowed',
              background: !isCheckoutDisabled ? 'linear-gradient(to right, var(--main-turquoise), var(--main-dark), var(--main-turquoise))' : '#CCCCCC',
              color: 'white',
              border: 'none',
              pointerEvents: !isCheckoutDisabled ? 'auto' : 'none',
            }}
          // href={Routes.CHECKOUT}
          />
        </section>
      </main>
    );
  };

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
      {renderBottomTabBar()}
    </components.Screen>
  );
});
