import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">About Rumor Check</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>Rumor Check helps verify claims against trusted institutional sources and relays official bulletins to communities in their preferred language via SMS.</p>
        </CardContent>
      </Card>
    </div>
  );
}