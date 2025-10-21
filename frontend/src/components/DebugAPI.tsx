// Debug component to check environment variables
export default function DebugAPI() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h3>API Debug Info</h3>
      <p><strong>NEXT_PUBLIC_API_BASE:</strong> {process.env.NEXT_PUBLIC_API_BASE || 'NOT SET'}</p>
      <p><strong>API_BASE (computed):</strong> {(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/$/, "")}</p>
      <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
    </div>
  );
}
