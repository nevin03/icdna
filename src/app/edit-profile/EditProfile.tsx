import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { svg } from '../../svg';
import { URLS } from '../../config';
import { Routes } from '../../routes';
import { components } from '../../components';
import { SelectField } from '../../components/SelectField';
import { stores } from '@/stores';
import { hooks } from '@/hooks';
import { UpdateProfileReturn } from '@/hooks/useUpdateProfile';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createApiService } from '@/lib/axios/apiService';
import { authClient } from '@/lib/axios/apiClient';
import { urls } from '@/lib/config/urls';

const privateApiService = createApiService(authClient);

export const EditProfile: React.FC = () => {
  const { handleFormInput, updateProfile, syncInitialData } = hooks.useUpdateProfile()
  const router = useRouter()
  const { goBack } = hooks.useNavigation()
  const { getPreviousUrl } = stores.useNavigationStore()

  const { amount: walletAmount, updateAmount } = stores.useWalletStore();

  // Check if user is coming from checkout page
  const isFromCheckout = () => {
    if (typeof window === 'undefined') return false;
    const previousUrl = getPreviousUrl();
    return previousUrl?.includes('/checkout') || false;
  };

  const [copySuccess, setCopySuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [userData, setUserData] = useState({
    name: typeof window !== 'undefined' ? localStorage.getItem("name") : null,
    email: typeof window !== 'undefined' ? localStorage.getItem("email") : null,
    image: typeof window !== 'undefined' ? localStorage.getItem("image") : null,
    address: typeof window !== 'undefined' ? localStorage.getItem("address") : null,
    pincode: typeof window !== 'undefined' ? localStorage.getItem("pincode") : null,
    mobile_number: typeof window !== 'undefined' ? localStorage.getItem("mobile_number") : null,
    state: typeof window !== 'undefined' ? localStorage.getItem("state") : null,
    city: typeof window !== 'undefined' ? localStorage.getItem("city") : null,
    landmark: typeof window !== 'undefined' ? localStorage.getItem("landmark") || "" : "",
    building_number: typeof window !== 'undefined' ? localStorage.getItem("building_number") || "" : "",
  });
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  // Sample 6-digit referral code - replace with actual user's referral code
  // const referralCode = 'ABC123';



  // Fetch fresh user data from backend on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await privateApiService.get<any>(urls.profile);

        if (response.status === 1 && response.user_data) {
          const userData = response.user_data;
          setReferralCode(userData.referral_code)
          // Update localStorage with fresh data from backend
          if (typeof window !== 'undefined') {
            localStorage.setItem('name', userData.name || "");
            localStorage.setItem('email', userData.email || "");
            localStorage.setItem('address', userData.address || "");
            localStorage.setItem('pincode', userData.pincode || "");
            localStorage.setItem('mobile_number', userData.mobile_number?.toString() || "");

            // Update wallet amount in centralized store with fresh data
            updateAmount(userData.wallet?.toString() || "0");

            // Note: profile_picture is handled separately as 'image' in localStorage
            if (userData.profile_picture && !userData.profile_picture.includes('default.svg')) {
              localStorage.setItem('image', userData.profile_picture);
            }
            localStorage.setItem('state', userData.state || "");
            localStorage.setItem('city', userData.city || "");
            localStorage.setItem('landmark', userData.landmark || "");
            localStorage.setItem('building_number', userData.building_number || "");
          }

          // Update component state with fresh data
          setUserData({
            name: userData.name || "",
            email: userData.email || "",
            image: userData.profile_picture || "",
            address: userData.address || "",
            pincode: userData.pincode || "",
            mobile_number: userData.mobile_number?.toString() || "",
            state: userData.state || "",
            city: userData.city || "",
            landmark: userData.landmark || "",
            building_number: userData.building_number || "",
          });

          // Sync the initial data in the hook to match the fresh data
          syncInitialData({
            name: userData.name || "",
            email: userData.email || "",
            address: userData.address || "",
            pincode: userData.pincode || "",
            mobile_number: userData.mobile_number?.toString() || "",
            state: userData.state || "",
            city: userData.city || "",
            landmark: userData.landmark || "",
            building_number: userData.building_number || "",
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Keep existing localStorage data if API fails
      }
    };

    fetchUserProfile();
  }, [syncInitialData]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await privateApiService.get<any[]>(urls['state-list']);
        if (Array.isArray(response)) {
          setStates(response);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!userData.state) {
        setCities([]);
        return;
      }

      let stateId = userData.state;
      let isNumericId = /^\d+$/.test(stateId.toString());

      // Check if state matches a name in 'states' list and needs conversion to ID
      if (states.length > 0) {
        // If stateId is not a number string (e.g. "1"), try to find by name
        const isFoundInStates = states.some(s => s.id.toString() === stateId.toString());
        if (!isFoundInStates) {
          const matched = states.find(s => s.name.toLowerCase() === stateId.toString().toLowerCase());
          if (matched) {
            stateId = matched.id;
            isNumericId = true;
            // Update local state to use ID so SelectField works correctly
            setUserData(prev => ({ ...prev, state: matched.id.toString() }));
          } else {
            return;
          }
        } else {
          isNumericId = true;
        }
      } else if (!isNumericId) {
        return;
      }

      if (!isNumericId) return;

      try {
        const response = await privateApiService.get<any[]>(`${urls['city-list']}/${stateId}`);
        if (Array.isArray(response)) {
          setCities(response);

          // Also try to resolve city name to ID if needed
          if (userData.city) {
            const cityId = userData.city;
            const isCityId = response.some(c => c.id.toString() === cityId.toString());
            if (!isCityId) {
              const matchedCity = response.find(c => c.name.toLowerCase() === cityId.toString().toLowerCase());
              if (matchedCity) {
                setUserData(prev => ({ ...prev, city: matchedCity.id.toString() }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, [userData.state, states]);

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Name validation - minimum 3 characters
    if (!userData.name || userData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation - exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!userData.mobile_number || !phoneRegex.test(userData.mobile_number.replace(/\s/g, ''))) {
      errors.mobile_number = 'Phone number must be exactly 10 digits';
    }

    // Building Number validation - ALWAYS MANDATORY
    if (!userData.building_number || userData.building_number.trim().length === 0) {
      errors.building_number = 'Building number is required';
    }

    // Address validation - ALWAYS MANDATORY
    if (!userData.address || userData.address.trim().length === 0) {
      errors.address = 'Delivery address is required';
    }

    // Landmark validation - ALWAYS MANDATORY
    if (!userData.landmark || userData.landmark.trim().length === 0) {
      errors.landmark = 'Landmark is required';
    }

    // Pincode validation - ALWAYS MANDATORY
    const pincodeRegex = /^\d{6}$/;
    if (!userData.pincode || userData.pincode.trim().length === 0) {
      errors.pincode = 'PIN code is required';
    } else if (!pincodeRegex.test(userData.pincode.trim())) {
      errors.pincode = 'PIN code must be exactly 6 digits';
    }

    // State and District validation - ALWAYS MANDATORY
    if (!userData.state || userData.state.trim().length === 0) {
      errors.state = 'State is required';
    }

    if (!userData.city || userData.city.trim().length === 0) {
      errors.city = 'District is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateUserProfile = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setSaveLoading(true);
    try {
      const profile_update_res: UpdateProfileReturn = await updateProfile()

      if (profile_update_res.status === 1) {
        // Update localStorage with response data
        localStorage.setItem('name', profile_update_res.data?.name || userData.name || "")
        localStorage.setItem('email', profile_update_res.data?.email || userData.email || "")
        localStorage.setItem('address', profile_update_res.data?.address || userData.address || "")
        localStorage.setItem('pincode', profile_update_res.data?.pincode || userData.pincode || "")
        localStorage.setItem('mobile_number', profile_update_res.data?.mobile_number?.toString() || userData?.mobile_number?.toString() || "")
        localStorage.setItem('state', profile_update_res.data?.state || userData.state || "")
        localStorage.setItem('city', profile_update_res.data?.city || userData.city || "")
        localStorage.setItem('landmark', profile_update_res.data?.landmark || userData.landmark || "")
        localStorage.setItem('building_number', profile_update_res.data?.building_number || userData.building_number || "")

        // Update wallet data if returned from updateProfile API
        if (profile_update_res.data?.wallet !== undefined) {
          updateAmount(profile_update_res.data.wallet.toString());
        }

        toast.success(profile_update_res.message || 'Profile updated successfully!');

        // Use goBack to return to previous page (e.g., checkout) instead of always going to TAB_NAVIGATOR
        goBack()
      } else if (profile_update_res.message === 'No changes detected in profile data') {
        toast.success('No changes to save.');
        goBack();
      } else {
        toast.error(profile_update_res.message || 'Error occurred while updating profile');
        console.error('Error :', profile_update_res.error, '\n', 'Message :', profile_update_res.message);
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  }

  const renderHeader = () => {
    return (
      <components.Header
        showGoBack={true}
        title='Profile'
      />
    );
  };

  const renderContent = () => {
    return (
      <main className='scrollable container'>

        {/* Profile Image Section */}
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 50,
            paddingBottom: 30,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 100,
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 20,
            }}
            className='center clickable'
          >
            <Image
              src={(typeof window !== 'undefined' ? localStorage.getItem('image') : null) || `${URLS.MAIN_URL}/assets/users/01.jpg`}
              alt='profile'
              width={0}
              height={0}
              priority={true}
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                backgroundColor: 'var(--main-dark)',
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                borderRadius: '50%',
                zIndex: 9999,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <svg.CameraSvg />
            </div>
          </div>

          {/* User Name and Referral Code */}
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: 'var(--main-dark)',
                margin: 0,
                marginBottom: 4,
                lineHeight: 2
              }}
            >
              {typeof window !== 'undefined' ? localStorage.getItem('name') : 'User'}
            </h2>
            <p
              style={{
                fontSize: 12,
                fontWeight: '600',
                // color: 'var(--main-turquoise)',
                color: '#a6bdda',
                letterSpacing: 3,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                borderRadius: 8,
                backgroundColor: '#F8FAFB',
                border: '2px dashed #E1E8ED',
                padding: 8,
                width: 'fit-content',
                marginInline: 'auto'
              }}
            >
              Referral Code <span style={{ color: '#a6bdda', letterSpacing: 3 }}>{referralCode}</span>
            </p>
          </div>
        </section>

        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'var(--main-dark)',
                marginBottom: 8,
                margin: 0,
              }}
            >
              Wallet Balance
            </h3>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Your current available balance
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 20px',
              borderRadius: 12,
              backgroundColor: '#F0F8FF',
              border: '1px solid #E3F2FD',
              marginBottom: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: 'var(--main-turquoise)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg.WalletSvg color="white" size={24} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: 'var(--main-dark)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  ₹{walletAmount}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                  }}
                >
                  Available balance
                </div>
              </div>
            </div>

            <button
              className='clickable'
              onClick={() => router.push(Routes.TOPUP_WALLET)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--main-turquoise)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              {/* <svg.PlusSvg  /> */}
              <span
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}
              >
                Add Funds
              </span>
            </button>
          </div>
        </section>

        {/* Referral Code Display Section */}
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'var(--main-dark)',
                marginBottom: 8,
                margin: 0,
              }}
            >
              Your Referral Code
            </h3>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Share this code with friends to earn rewards
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 15px',
              borderRadius: 12,
              backgroundColor: '#F8FAFB',
              border: '2px dashed #E1E8ED',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'var(--main-color, #4A90E2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg.TagSvg />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: 'var(--main-dark)',
                    letterSpacing: 4,
                    fontFamily: 'monospace',
                  }}
                >
                  {referralCode}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                  }}
                >
                  Tap to copy
                </div>
              </div>
            </div>

            <div
              className='clickable'
              style={{
                padding: '12px',
                borderRadius: 8,
                // backgroundColor: 'var(--main-color, #4A90E2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 44,
                minHeight: 44,
                transition: 'all 0.2s ease',
              }}
              onClick={handleCopyReferralCode}
            >
              <svg.CopySvg />
            </div>

            {copySuccess && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'var(--success-color, #28a745)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {copySuccess}
              </div>
            )}
          </div>
        </section>

        {/* Profile Information Section */}
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginBottom: 10,
          }}
        >
          {/* Section Header */}
          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'var(--main-dark)',
                marginBottom: 8,
                margin: 0,
              }}
            >
              {isFromCheckout() ? 'Delivery Information' : 'Personal Information'}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: '#FFC000',
                fontWeight: 'bolder',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {isFromCheckout()
                ? <>Complete your delivery details to proceed with checkout. Fields marked with <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '1rem' }}>*</span> are required.</>
                : <>Fields marked with <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '1rem' }}>*</span> are required</>
              }
            </p>
          </div>

          {/* Full Name - Required */}
          <div style={{ marginBottom: validationErrors.name ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Full Name
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='text'
              name='name'
              inputType='username'
              placeholder='Enter your full name'
              containerStyle={{
                border: validationErrors.name ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.name ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.name || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  name: e.target.value
                }))
                handleFormInput(e)
                // Clear error when user starts typing
                if (validationErrors.name) {
                  setValidationErrors(prev => ({ ...prev, name: '' }));
                }
              }}
            />
          </div>
          {validationErrors.name && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.name}
            </div>
          )}

          {/* Email - Required */}
          <div style={{ marginBottom: validationErrors.email ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Email Address
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='email'
              name='email'
              inputType='email'
              placeholder='Enter your email address'
              containerStyle={{
                border: validationErrors.email ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.email ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.email || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  email: e.target.value
                }))
                handleFormInput(e)
                // Clear error when user starts typing
                if (validationErrors.email) {
                  setValidationErrors(prev => ({ ...prev, email: '' }));
                }
              }}
            />
          </div>
          {validationErrors.email && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.email}
            </div>
          )}

          {/* Phone Number - Required */}
          <div style={{ marginBottom: validationErrors.mobile_number ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Phone Number
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='tel'
              inputType='phone'
              name='mobile_number'
              placeholder='Enter your 10-digit phone number'
              containerStyle={{
                border: validationErrors.mobile_number ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.mobile_number ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.mobile_number || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  mobile_number: e.target.value
                }))
                handleFormInput(e)
                // Clear error when user starts typing
                if (validationErrors.mobile_number) {
                  setValidationErrors(prev => ({ ...prev, mobile_number: '' }));
                }
              }}
            />
          </div>
          {validationErrors.mobile_number && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.mobile_number}
            </div>
          )}

          {/* Building Number - Required */}
          <div style={{ marginBottom: validationErrors.building_number ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Building Number
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='text'
              name='building_number'
              placeholder='Enter building/house number'
              inputType='building'
              containerStyle={{
                border: validationErrors.building_number ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.building_number ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.building_number || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  building_number: e.target.value
                }))
                handleFormInput(e)
                if (validationErrors.building_number) {
                  setValidationErrors(prev => ({ ...prev, building_number: '' }));
                }
              }}
            />
          </div>
          {validationErrors.building_number && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.building_number}
            </div>
          )}

          {/* Address - Required */}
          <div style={{ marginBottom: validationErrors.address ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Delivery Address
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='text'
              name='address'
              placeholder='Enter your delivery address'
              inputType='location'
              containerStyle={{
                border: validationErrors.address ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.address ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.address || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  address: e.target.value
                }))
                handleFormInput(e)
                // Clear error when user starts typing
                if (validationErrors.address) {
                  setValidationErrors(prev => ({ ...prev, address: '' }));
                }
              }}
            />
          </div>
          {validationErrors.address && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.address}
            </div>
          )}

          {/* Landmark - Required */}
          <div style={{ marginBottom: validationErrors.landmark ? 4 : 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                Landmark
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='text'
              name='landmark'
              placeholder='Enter nearby landmark'
              inputType='landmark'
              containerStyle={{
                border: validationErrors.landmark ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.landmark ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.landmark || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  landmark: e.target.value
                }))
                handleFormInput(e)
                if (validationErrors.landmark) {
                  setValidationErrors(prev => ({ ...prev, landmark: '' }));
                }
              }}
            />
          </div>
          {validationErrors.landmark && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.landmark}
            </div>
          )}

          {/* PIN Code - Required */}
          <div style={{ marginBottom: validationErrors.pincode ? 4 : 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
              gap: 4
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--main-dark)'
              }}>
                PIN Code
              </span>
              <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
            </div>
            <components.InputField
              type='text'
              name='pincode'
              placeholder='Enter 6-digit PIN code'
              inputType='pin-number'
              containerStyle={{
                border: validationErrors.pincode ? '2px solid #C53030' : '1px solid #E5E7EB',
                backgroundColor: validationErrors.pincode ? '#FFF5F5' : 'var(--white-color)'
              }}
              value={userData.pincode || ""}
              onChange={(e) => {
                setUserData(pre => ({
                  ...pre,
                  pincode: e.target.value
                }))
                handleFormInput(e)
                // Clear error when user starts typing
                if (validationErrors.pincode) {
                  setValidationErrors(prev => ({ ...prev, pincode: '' }));
                }
              }}
            />
          </div>
          {validationErrors.pincode && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '0px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.pincode}
            </div>
          )}

          {/* State & District */}
          <div style={{ display: 'flex', marginTop: "20px", gap: 10, marginBottom: (validationErrors.state || validationErrors.city) ? 4 : 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                gap: 4
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--main-dark)'
                }}>
                  State
                </span>
                <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
              </div>
              <SelectField
                name='state'
                placeholder='Select State'
                options={states}
                value={userData.state || ""}
                onChange={(e) => {
                  setUserData(pre => ({
                    ...pre,
                    state: e.target.value,
                    city: "" // Reset city when state changes
                  }))
                  handleFormInput(e)
                  if (validationErrors.state) {
                    setValidationErrors(prev => ({ ...prev, state: '' }));
                  }
                }}
                containerStyle={{
                  border: validationErrors.state ? '2px solid #C53030' : '1px solid #E5E7EB',
                  backgroundColor: validationErrors.state ? '#FFF5F5' : 'var(--white-color)'
                }}
              />
              {validationErrors.state && (
                <div style={{
                  color: '#C53030',
                  fontSize: '12px',
                  marginTop: '4px',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  ⚠️ {validationErrors.state}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                gap: 4
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--main-dark)'
                }}>
                  District
                </span>
                <span style={{ color: '#C53030', fontWeight: 'bold', fontSize: '16px' }}>*</span>
              </div>
              <SelectField
                name='city'
                placeholder='Select District'
                options={cities}
                value={userData.city || ""}
                disabled={!userData.state}
                onChange={(e) => {
                  setUserData(pre => ({
                    ...pre,
                    city: e.target.value
                  }))
                  handleFormInput(e)
                  if (validationErrors.city) {
                    setValidationErrors(prev => ({ ...prev, city: '' }));
                  }
                }}
                containerStyle={{
                  border: validationErrors.city ? '2px solid #C53030' : '1px solid #E5E7EB',
                  backgroundColor: validationErrors.city ? '#FFF5F5' : 'var(--white-color)'
                }}
              />
              {validationErrors.city && (
                <div style={{
                  color: '#C53030',
                  fontSize: '12px',
                  marginTop: '4px',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  ⚠️ {validationErrors.city}
                </div>
              )}
            </div>
          </div>
        </section>


        {/* Save Button Section */}
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 20,
            paddingBottom: 20,
            marginBottom: 20,
          }}
        >
          <components.Button
            label='save changes'
            loading={saveLoading}
            loadingLabel='Saving...'
            onClick={() => {
              updateUserProfile()
            }}
            containerStyle={{ marginBottom: 0 }}
          />
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
