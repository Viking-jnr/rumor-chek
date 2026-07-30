import { useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AccessGate({ onUnlock }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);

    function handleSubmit(e) {
        e.preventDefault();
        if (!code.trim()) return;
        setError(null);
        onUnlock(code);
    }
    return(
        <form onSubmit={handleSubmit} className="space-y-3 max-w-xs">
            <p className="text-sm text-gray-600">Enter the official access code to continue</p>
            <Input
            type = "password"
            placeholder = "Access Code"
            value = {code}
            onChange = {(e) => setCode(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error} </p>}
            <Button type="submit">Unlock</Button>
        </form>
    )
}