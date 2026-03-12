import React from 'react';
import Image from 'next/image';

import { svg } from '../../../svg';
import { URLS } from '../../../config';
import { Routes } from '../../../routes';
import { components } from '../../../components';
import { SelectField } from '../../../components/SelectField';
import { hooks } from '@/hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserFormDataType } from '@/hooks/useAuthentication';
import { enableNotificationsAndSendToken } from '@/utility/notificationUtils';
import { stores } from '@/stores';
import { createApiService } from '@/lib/axios/apiService';
import { authClient } from '@/lib/axios/apiClient';
import { urls } from '@/lib/config/urls';

const privateApiService = createApiService(authClient);

export const CreateProfile: React.FC = () => {

  const { handleFormInput, register } = hooks.useAuthentication()
  const { updateAmount } = stores.useWalletStore();
  const router = useRouter();
  const { data: session, status } = useSession() // Added status

  React.useEffect(() => {
    // Only redirect if session status is determined and no googleId
    if (status === 'authenticated' && !session?.user?.googleId) {
      router.replace(Routes.SIGN_IN);
    }
  }, [session, status, router]);

  // Render nothing or a loader while session is loading or if redirecting
  if (status === 'loading' || (status === 'authenticated' && !session?.user?.googleId)) {
    return null; // Or a loading spinner
  }

  const [userData, setUserData] = React.useState<UserFormDataType>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    mobile_number: "",
    address: "",
    pincode: "",
    referral_code: "",
    state: "",
    city: "",
    landmark: "",
    building_number: ""
  })

  const [states, setStates] = React.useState<any[]>([]);
  const [cities, setCities] = React.useState<any[]>([]);

  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});
  const [saveLoading, setSaveLoading] = React.useState(false);

  // Fetch states on component mount
  React.useEffect(() => {
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

  // Fetch cities when state changes
  React.useEffect(() => {
    const fetchCities = async () => {
      if (!userData.state || !/^\d+$/.test(userData.state.toString())) {
        if (!userData.state) setCities([]);
        return;
      }

      try {
        const response = await privateApiService.get<any[]>(`${urls['city-list']}/${userData.state}`);
        if (Array.isArray(response)) {
          setCities(response);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, [userData.state]);

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

  const handleRegistration = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    if (!session?.user?.googleId) {
      console.error('Google ID is missing, cannot register.');
      // Optionally, redirect or show an error message to the user
      // router.push(Routes.SIGN_IN);
      return;
    }
    setSaveLoading(true);
    try {
      const registrationResponse = await register(session.user.googleId) // Now googleId is guaranteed to be a string
      if (registrationResponse.status === 1) {
        // Registration successful - store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('name', registrationResponse.data?.name || session?.user?.name || "")
          localStorage.setItem('email', registrationResponse.data?.email || session?.user?.email || "")
          localStorage.setItem('image', session?.user?.image || "")
          localStorage.setItem('mobile_number', registrationResponse.data?.mobile_number?.toString() || "")
          localStorage.setItem('address', registrationResponse.data?.address || "")
          localStorage.setItem('pincode', registrationResponse.data?.pincode || "")
          localStorage.setItem('state', registrationResponse.data?.state || "")
          localStorage.setItem('city', registrationResponse.data?.city || "")
          localStorage.setItem('landmark', registrationResponse.data?.landmark || "")
          localStorage.setItem('building_number', registrationResponse.data?.building_number || "")
        }

        // Sync wallet store with the updated localStorage value
        updateAmount(registrationResponse.data?.wallet?.toString() || "0");

        // Try to enable notifications for newly registered users
        try {
          console.log('Attempting to enable notifications for new user...');
          const notificationResult = await enableNotificationsAndSendToken();

          if (notificationResult.success) {
            console.log('Notifications enabled successfully for new user');
          } else {
            console.log('Notifications not enabled for new user:', notificationResult.error);
            // Don't block the registration flow if notifications fail
          }
        } catch (error) {
          console.error('Error enabling notifications for new user:', error);
          // Don't block the registration flow if notifications fail
        }

        router.replace(Routes.TAB_NAVIGATOR)
      } else {
        console.warn('Error during registration try again!');
      }
    } catch (error) {
      console.error('An error occured during registration of new user, please signup again!');
      router.push(Routes.SIGN_IN)
    } finally {
      setSaveLoading(false);
    }
  }

  const renderHeader = () => {
    return (
      <components.Header
        showGoBack={false}
        title='Create profile'
      />
    );
  };

  const renderContent = () => {
    return (
      <main className='scrollable container'>
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
              marginBottom: 30,
            }}
            className='center clickable'
          >
            <Image
              src={session?.user?.image || `${URLS.MAIN_URL}/assets/users/01.jpg`}
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
          <components.InputField
            type='text'
            name='name'
            inputType='username'
            value={userData.name}
            placeholder='Enter your full name'
            containerStyle={{ marginBottom: validationErrors.name ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, name: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.name) {
                setValidationErrors(prev => ({ ...prev, name: '' }));
              }
            }}
          />
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
          <components.InputField
            type='email'
            name='email'
            inputType='email'
            placeholder='Email'
            value={userData.email}
            containerStyle={{ marginBottom: validationErrors.email ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, email: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: '' }));
              }
            }}
          />
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
          <components.InputField
            type='tel'
            name='mobile_number'
            inputType='phone'
            placeholder='Phone number'
            containerStyle={{ marginBottom: validationErrors.mobile_number ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, mobile_number: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.mobile_number) {
                setValidationErrors(prev => ({ ...prev, mobile_number: '' }));
              }
            }}
          />
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
          <components.InputField
            type='text'
            name='building_number'
            placeholder='Building/House Number'
            inputType='building'
            containerStyle={{
              marginBottom: validationErrors.building_number ? 4 : 20,
              border: validationErrors.building_number ? '2px solid #C53030' : undefined,
              backgroundColor: validationErrors.building_number ? '#FFF5F5' : undefined
            }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, building_number: e.target.value }))
              handleFormInput(e)
              if (validationErrors.building_number) {
                setValidationErrors(prev => ({ ...prev, building_number: '' }));
              }
            }}
          />
          {validationErrors.building_number && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '20px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.building_number}
            </div>
          )}
          <components.InputField
            type='text'
            name='address'
            placeholder='Your address'
            inputType='location'
            containerStyle={{ marginBottom: validationErrors.address ? 4 : 20 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, address: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.address) {
                setValidationErrors(prev => ({ ...prev, address: '' }));
              }
            }}
          />
          {validationErrors.address && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '20px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.address}
            </div>
          )}
          <components.InputField
            type='text'
            name='landmark'
            placeholder='Landmark'
            inputType='landmark'
            containerStyle={{
              marginBottom: validationErrors.landmark ? 4 : 20,
              border: validationErrors.landmark ? '2px solid #C53030' : undefined,
              backgroundColor: validationErrors.landmark ? '#FFF5F5' : undefined
            }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, landmark: e.target.value }))
              handleFormInput(e)
              if (validationErrors.landmark) {
                setValidationErrors(prev => ({ ...prev, landmark: '' }));
              }
            }}
          />
          {validationErrors.landmark && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '20px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.landmark}
            </div>
          )}
          <components.InputField
            type='text'
            name='pincode'
            placeholder='PIN code'
            inputType='pin-number'
            containerStyle={{
              marginBottom: validationErrors.pincode ? 4 : 0,
              border: validationErrors.pincode ? '2px solid #C53030' : undefined,
              backgroundColor: validationErrors.pincode ? '#FFF5F5' : undefined
            }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, pincode: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.pincode) {
                setValidationErrors(prev => ({ ...prev, pincode: '' }));
              }
            }}
          />
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
          <div style={{ display: 'flex', marginTop: "20px", gap: 10, marginBottom: (validationErrors.state || validationErrors.city) ? 4 : 0 }}>
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

        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginTop: 10,
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
                fontSize: 18,
                fontWeight: '600',
                color: 'var(--main-dark)',
                marginBottom: 8,
                margin: 0,
              }}
            >
              Have a referral code?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Enter your referral code to get exclusive rewards and benefits
            </p>
          </div>
          <components.InputField
            type='text'
            name='referral_code'
            inputType='promocode'
            placeholder='Enter referral code (optional)'
            containerStyle={{ marginBottom: 0 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, referral_code: e.target.value }))
              handleFormInput(e)
            }}
          />
        </section>

        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginBottom: 20,
          }}
        >
          <components.Button
            label='save changes'
            href={Routes.TAB_NAVIGATOR}
            loading={saveLoading}
            loadingLabel='Saving...'
            containerStyle={{ marginBottom: 0 }}
            onClick={handleRegistration}
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
