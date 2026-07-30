import { useState } from "react";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { previewBulletin, sendBulletin } from '@/lib/api';

const WARDS = ['Nairobi','Turkana Central', 'Kajiado Town'];

export default function BulletinForm({ accessCode, onUnauthorized}) {
    const [originalText, setOriginalText] = useState('');
    const [ward, setWard] = useState(WARDS[0]);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sendResult, setSendResult] = useState(null);

    async function handlePreview(e) {
        e.preventDefault();
        if (!originalText.trim()) return;
        setLoading(true);
        setError(null);
        setSendResult(null);
        try {
            const result = await previewBulletin({ originalText, ward, accessCode });
            setPreview(result);
        } catch (err) {
            if (err.message === 'UNAUTHORIZED!') return onUnauthorized();
            setError('Could not generate a preview. Try again.');
        } finally {
            setLoading(false);
        }
    }
  async function handleSend() {
        setLoading(true);
        setError(null);
    try {
        const result = await sendBulletin(preview.bulletin_id, accessCode);
        setSendResult(result);
    } catch (err) {
        if (err.message === 'UNAUTHORIZED!') return onUnauthorized();
        setError('Could not send the bulletin. Try again.');
    } finally {
        setLoading(false);
    }
  }

    return(
        <div className="space-y-4">
            <form onSubmit={handlePreview} className="space-y-4">
                <Textarea
                placeholder="Write the official bulletin text here..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                rows={5}
                />
                <Select value={ward} onValueChange= {setWard}>
                    <SelectTrigger className="w-56">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {WARDS.map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Generating...': 'Preview simplified bulletin'}
                </Button>
            </form>

            {preview && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Preview (Kiswahili)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="italic">{preview.simplified_text}</p>
                        {!sendResult ? (
                        <Button onClick={handleSend} disabled={loading}>
                            {loading ? 'Sending...' : `Send to ${ward} subscribers`}
                        </Button>
                        ) : (
                        <p className="text-sm text-green-700">
                            Sent to {sendResult.recipients} subscriber(s) in {sendResult.languages.join(', ')}.
                        </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}