import { useState } from "react";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitClaim } from "@/lib/api.js";

export default function ClaimForm({ onResult }) {
    const [claimText, setClaimText] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e){
        e.preventDefault();
        if (!claimText.trim()) return;
        setLoading(true);
        setError(null)

        try{
            const result = await submitClaim({ claimText, category, location});
            onResult(result);
        }catch(err){
            setError("Something went wrong checking that claim! Try again");
        }finally{
            setLoading(false);
        }
    }

    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
            placeholder = "What have you heard? e.g. 'Cholera outbreak reported in Turkana'"
            value = {claimText}
            onChange = {(e) => setClaimText(e.target.value)}
            rows={3}
            />
            <div className="flex gap-3">
                <Select value={category} onValueChange={setCategory} >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder = "Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Weather">Weather</SelectItem>
                        <SelectItem value="Food Security">Food security</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} >
                {loading ? 'Checking...': 'Check this Claim'}
            </Button>

        </form>
    )
}