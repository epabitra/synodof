/**
 * Donate Page
 * Dynamic page showing account information and QR code for donations
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { publicAPI } from '@/services/api';
import { ENV } from '@/config/env';
import { BreadcrumbSchema } from '@/components/SEO/StructuredData';
import Loading from '@/components/Loading';

const Donate = () => {
  const [loading, setLoading] = useState(true);
  const [donateInfo, setDonateInfo] = useState(null);

  useEffect(() => {
    loadDonateData();
  }, []);

  const loadDonateData = async () => {
    try {
      setLoading(true);
      const donateData = await publicAPI.getDonateInfo().catch(() => null);

      if (donateData?.success && donateData.data) {
        setDonateInfo(donateData.data);
      } else {
        // Fallback to default values if API fails
        setDonateInfo({
          bank_name: 'State Bank of India',
          account_name: 'Berhampur Diocesan Synod',
          account_number: '1234567890123456',
          ifsc_code: 'SBIN0001234',
          branch: 'Berhampur Main Branch',
          upi_id: 'donate@synodofberhampur',
          upi_name: 'Berhampur Diocesan Synod',
          qr_code_url: '',
          additional_info: '',
        });
      }
    } catch (error) {
      console.error('Error loading donate data:', error);
      // Fallback to default values
      setDonateInfo({
        bank_name: 'State Bank of India',
        account_name: 'Berhampur Diocesan Synod',
        account_number: '1234567890123456',
        ifsc_code: 'SBIN0001234',
        branch: 'Berhampur Main Branch',
        upi_id: 'donate@synodofberhampur',
        upi_name: 'Berhampur Diocesan Synod',
        qr_code_url: '',
        additional_info: '',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code URL if not provided
  const getQrCodeUrl = () => {
    if (donateInfo?.qr_code_url) {
      return donateInfo.qr_code_url;
    }
    // Fallback: Generate QR code using service
    if (donateInfo?.upi_id) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `UPI:${donateInfo.upi_id}${donateInfo.account_number ? `|Account:${donateInfo.account_number}` : ''}${donateInfo.ifsc_code ? `|IFSC:${donateInfo.ifsc_code}` : ''}`
      )}`;
    }
    return '';
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(`${label} copied to clipboard!`);
    });
  };

  if (loading) {
    return <Loading fullScreen message="Loading donation information..." />;
  }

  if (!donateInfo) {
    return (
      <div className="donate-page">
        <div className="section">
          <div className="container-narrow">
            <div className="text-center" style={{ padding: 'var(--space-12)' }}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
                Donation information is not available at the moment. Please check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const qrCodeUrl = getQrCodeUrl();

  return (
    <>
      <Helmet>
        <title>Donate | {ENV.SITE_NAME}</title>
        <meta name="description" content="Support Berhampur Diocesan Synod through donations. Make a difference in our community programs and initiatives." />
        <meta name="keywords" content="donate, Berhampur Diocesan Synod, donation, support, charity, Christian NGO donation" />
        <meta property="og:url" content={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/donate`} />
        <link rel="canonical" href={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/donate`} />
      </Helmet>
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Donate', url: '/donate' }
      ]} />

      <div className="donate-page">
        <div className="section">
          <div className="container-narrow">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h1>Support Our Mission</h1>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-lg)',
                marginTop: 'var(--space-4)',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Your generous donations help us continue our work in the community. Every contribution makes a difference.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-12)'
            }}>
              {/* Account Information Card */}
              <div style={{
                background: 'var(--bg-secondary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)'
              }}>
                <h2 style={{ marginBottom: 'var(--space-6)' }}>Bank Account Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                      Account Name
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                        {donateInfo.account_name || 'N/A'}
                      </p>
                      <button
                        onClick={() => copyToClipboard(donateInfo.account_name, 'Account Name')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 'var(--text-lg)',
                          padding: 'var(--space-1)',
                          color: 'var(--text-secondary)'
                        }}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                      Account Number
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', fontFamily: 'monospace' }}>
                        {donateInfo.account_number || 'N/A'}
                      </p>
                      {donateInfo.account_number && (
                        <button
                          onClick={() => copyToClipboard(donateInfo.account_number, 'Account Number')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-lg)',
                            padding: 'var(--space-1)',
                            color: 'var(--text-secondary)'
                          }}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                      IFSC Code
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', fontFamily: 'monospace' }}>
                        {donateInfo.ifsc_code || 'N/A'}
                      </p>
                      {donateInfo.ifsc_code && (
                        <button
                          onClick={() => copyToClipboard(donateInfo.ifsc_code, 'IFSC Code')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-lg)',
                            padding: 'var(--space-1)',
                            color: 'var(--text-secondary)'
                          }}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>

                  {donateInfo.bank_name && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        Bank Name
                      </h3>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                        {donateInfo.bank_name}
                      </p>
                    </div>
                  )}

                  {donateInfo.branch && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        Branch
                      </h3>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                        {donateInfo.branch}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI Information Card */}
              <div style={{
                background: 'var(--bg-secondary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)'
              }}>
                <h2 style={{ marginBottom: 'var(--space-6)' }}>UPI Payment</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {donateInfo.upi_id && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        UPI ID
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                          {donateInfo.upi_id}
                        </p>
                        <button
                          onClick={() => copyToClipboard(donateInfo.upi_id, 'UPI ID')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-lg)',
                            padding: 'var(--space-1)',
                            color: 'var(--text-secondary)'
                          }}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}

                  {donateInfo.upi_name && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        UPI Name
                      </h3>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
                        {donateInfo.upi_name}
                      </p>
                    </div>
                  )}

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div style={{
                      marginTop: 'var(--space-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-4)'
                    }}>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        Scan QR Code to Pay
                      </h3>
                      <div style={{
                        background: 'white',
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <img
                          src={qrCodeUrl}
                          alt="QR Code for UPI Payment"
                          style={{
                            width: '250px',
                            height: '250px',
                            maxWidth: '100%',
                            display: 'block'
                          }}
                          onError={(e) => {
                            console.error('QR code image failed to load');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Scan this QR code with any UPI app to make a payment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(donateInfo.additional_info || true) && (
              <div style={{
                background: 'var(--bg-secondary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)',
                marginTop: 'var(--space-8)'
              }}>
                <h2 style={{ marginBottom: 'var(--space-4)' }}>Important Information</h2>
                {donateInfo.additional_info ? (
                  <div style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.6'
                  }}>
                    {donateInfo.additional_info}
                  </div>
                ) : (
                  <ul style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    padding: 0
                  }}>
                    <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-lg)' }}>ℹ️</span>
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                        All donations are tax-deductible as per applicable laws. Please keep your transaction receipt for tax purposes.
                      </p>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-lg)' }}>ℹ️</span>
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                        After making a donation, please contact us with your transaction details if you need a receipt.
                      </p>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-lg)' }}>ℹ️</span>
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                        Your contributions help us support various community programs, education initiatives, and social welfare activities.
                      </p>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--text-lg)' }}>ℹ️</span>
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                        For any queries regarding donations, please contact us through our contact page.
                      </p>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Donate;

