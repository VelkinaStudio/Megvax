import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Megvax - AI-Powered Ad Management Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #111827 40%, #0A0A0F 100%)',
          position: 'relative',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              marginBottom: '32px',
              boxShadow: '0 0 60px rgba(37,99,235,0.3)',
            }}
          >
            <span
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              M
            </span>
          </div>

          {/* Brand name */}
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '16px',
            }}
          >
            Megvax
          </span>

          {/* Tagline */}
          <span
            style={{
              fontSize: '24px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              maxWidth: '600px',
              lineHeight: 1.4,
            }}
          >
            Your ads on autopilot. AI-powered management for Meta, Google & TikTok campaigns.
          </span>

          {/* Accent bar */}
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#2563EB',
                }}
              >
                +147%
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: '4px',
                }}
              >
                Avg. ROAS Lift
              </span>
            </div>

            <div
              style={{
                width: '1px',
                height: '40px',
                background: 'rgba(255,255,255,0.1)',
              }}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#2563EB',
                }}
              >
                12hrs
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: '4px',
                }}
              >
                Saved / Week
              </span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, #2563EB 50%, transparent 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
