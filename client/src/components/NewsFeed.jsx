import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentClaims } from '@/lib/api';
import { VERDICT_STYLES } from '@/lib/verdictStyles';

export default function NewsFeed() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentClaims().then(setClaims).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading recent claims...</p>;
  if (claims.length === 0) return <p className="text-gray-500">No claims checked yet.</p>;

  return (
    <div className="space-y-3">
      {claims.map((c) => {
        const style = VERDICT_STYLES[c.verdict] || VERDICT_STYLES.unverified;
        return (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-normal">
                <Badge className={style.className}>{style.label}</Badge>
                <span className="text-xs text-gray-400">
                  {new Date(c.submitted_at).toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{c.claim_text}</p>
              {c.reasoning && <p className="text-xs text-gray-500 mt-1">{c.reasoning}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}