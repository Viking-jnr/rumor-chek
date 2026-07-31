import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyAccessCode } from '@/lib/api';

export default function AccessGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setChecking(true);

    try {
      const valid = await verifyAccessCode(code);
      if (!valid) {
        setError('Incorrect access code.');
        return;
      }
      onUnlock(code);
    } catch (err) {
      setError('Could not reach the server to verify the code.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-xs">
      <p className="text-sm text-gray-600">Enter the official access code to continue.</p>
      <p className='text-sm text-gray-300'>Will add Accounts and Authentication for Officials later</p>
      <Input
        type="password"
        placeholder="For testing, the accesscode is 'gatepass101'"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={checking}>
        {checking ? 'Checking...' : 'Unlock'}
      </Button>
    </form>
  );
}