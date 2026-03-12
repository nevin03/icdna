'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { svg } from '@/svg';
import { createApiService } from '@/lib/axios/apiService';
// import { publicClient } from '@/lib/axios/apiClient';
import { urls } from '@/lib/config/urls';
import noAuthClient from '@/lib/axios/noAuthClient';

const publicApiService = createApiService(noAuthClient);

interface SettingsResponse {
    status: number;
    settings: {
        id: number;
        platform_fee: number;
        delivery_charge: number;
        mobile_number: string;
        privacy_policy: string;
        terms_and_conditions: string;
        email: string;
    };
}

const SupportCenter: React.FC = () => {
    const router = useRouter();
    const [settings, setSettings] = useState<SettingsResponse['settings'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch settings data on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const response = await publicApiService.get<SettingsResponse>(urls.settings);

                if (response.status === 1) {
                    setSettings(response.settings);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handlePhoneCall = () => {
        const phoneNumber = settings?.mobile_number || '+1-800-FOOD-123';
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleEmailContact = () => {
        const email = settings?.email || 'support@foodapp.com';
        window.location.href = `mailto:${email}?subject=Support Request&body=Hi there! I need help with...`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--white-color)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--white-color)',
                zIndex: 10,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span style={{ rotate: '180deg' }}>
                        <svg.RightArrowSvg />
                    </span>
                </button>

                <h1 style={{
                    fontSize: '18px',
                    fontWeight: 'var(--fw-semibold)',
                    color: 'var(--main-dark)',
                    margin: 0,
                    fontFamily: 'var(--font-dm-sans)',
                }}>
                    Support Center
                </h1>

                <div style={{ width: '40px' }} /> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '500px',
                margin: '0 auto',
                width: '100%',
            }}>

                {/* Welcome Message */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '20px',
                        animation: 'gentleBounce 2s ease-in-out infinite',
                    }}>
                        🤝
                    </div>

                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 'var(--fw-bold)',
                        color: 'var(--main-dark)',
                        margin: '0 0 12px 0',
                        fontFamily: 'var(--font-dm-sans)',
                        letterSpacing: '-0.5px',
                    }}>
                        We're Here to Help!
                    </h2>

                    <p style={{
                        fontSize: '16px',
                        color: 'var(--text-color)',
                        lineHeight: '1.5',
                        margin: 0,
                        fontFamily: 'var(--font-dm-sans)',
                    }}>
                        Have a question or need assistance? Our friendly support team is ready to help you with your food ordering experience.
                    </p>
                </div>

                {/* Contact Options */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginBottom: '40px',
                }}>

                    {/* Phone Contact */}
                    <button
                        onClick={handlePhoneCall}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--white-color)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-dm-sans)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--main-turquoise)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 64, 43, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--main-turquoise) 0%, #0a5a3d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                        }}>
                            📞
                        </div>

                        <div style={{
                            flex: 1,
                            textAlign: 'left',
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 'var(--fw-semibold)',
                                color: 'var(--main-dark)',
                                margin: '0 0 4px 0',
                            }}>
                                Call Us
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-color)',
                                margin: '0 0 2px 0',
                            }}>
                                {isLoading ? 'Loading...' : (settings?.mobile_number || '+1-800-FOOD-123')}
                            </p>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--text-color)',
                                margin: 0,
                                opacity: 0.8,
                            }}>
                                Available 24/7 for your convenience
                            </p>
                        </div>

                        <svg.RightArrowSvg />
                    </button>

                    {/* Email Contact */}
                    <button
                        onClick={handleEmailContact}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--white-color)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-dm-sans)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--main-color)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 138, 113, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--main-color) 0%, #e6744f 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                        }}>
                            ✉️
                        </div>

                        <div style={{
                            flex: 1,
                            textAlign: 'left',
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 'var(--fw-semibold)',
                                color: 'var(--main-dark)',
                                margin: '0 0 4px 0',
                            }}>
                                Email Us
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-color)',
                                margin: '0 0 2px 0',
                            }}>
                                {isLoading ? 'Loading...' : (settings?.email || 'support@foodapp.com')}
                            </p>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--text-color)',
                                margin: 0,
                                opacity: 0.8,
                            }}>
                                We'll respond within 24 hours
                            </p>
                        </div>

                        <svg.RightArrowSvg />
                    </button>
                </div>

                {/* Additional Support Message */}
                <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: '#F8FFFE',
                    border: '1px solid rgba(6, 64, 43, 0.1)',
                    width: '100%',
                }}>
                    <div style={{
                        fontSize: '24px',
                        marginBottom: '12px',
                    }}>
                        💚
                    </div>

                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'var(--fw-semibold)',
                        color: 'var(--main-dark)',
                        margin: '0 0 8px 0',
                        fontFamily: 'var(--font-dm-sans)',
                    }}>
                        Your satisfaction matters to us
                    </h3>

                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-color)',
                        lineHeight: '1.4',
                        margin: 0,
                        fontFamily: 'var(--font-dm-sans)',
                    }}>
                        Whether you have questions about your order, need help with the app, or want to share feedback, we're here to listen and help make your experience better.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SupportCenter;
