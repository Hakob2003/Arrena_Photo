'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: 'black', color: 'red', display: 'flex', flexDirection: 'column', padding: '50px', fontFamily: 'sans-serif' }}>
        <h2>Critical Root Error</h2>
        <p style={{ color: 'white' }}>{error.message || 'Unknown error'}</p>
        <p style={{ color: 'gray', fontSize: '12px' }}>{error.stack}</p>
        <button 
          onClick={() => reset()} 
          style={{ marginTop: '20px', padding: '10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
