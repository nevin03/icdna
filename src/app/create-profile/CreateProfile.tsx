import React from 'react';
import Image from 'next/image';

import {svg} from '../../svg';
import {URLS} from '../../config';
import {Routes} from '../../routes';
import {components} from '../../components';

export const CreateProfile: React.FC = () => {
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
              src={`${URLS.MAIN_URL}/assets/users/01.jpg`}
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
            inputType='username'
            placeholder='Enter your full name'
            containerStyle={{marginBottom: 14}}
          />
          <components.InputField
            type='email'
            inputType='email'
            placeholder='Email'
            containerStyle={{marginBottom: 14}}
          />
          <components.InputField
            type='tel'
            inputType='phone'
            placeholder='Phone number'
            containerStyle={{marginBottom: 14}}
          />
          <components.InputField
            type='text'
            placeholder='Your address'
            inputType='location'
            containerStyle={{marginBottom: 20}}
          />
          <components.InputField
            type='text'
            placeholder='PIN code'
            inputType='pin-number'
            containerStyle={{marginBottom: 0}}
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
            inputType='promocode'
            placeholder='Enter referral code (optional)'
            containerStyle={{marginBottom: 0}}
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
            containerStyle={{marginBottom: 0}}
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
