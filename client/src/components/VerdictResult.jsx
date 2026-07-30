import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge} from '@/components/ui/badge';

const Verdict_Styles = {
    verified: {label: 'Verified', className: 'bg-green-100 text-green-800'},
    unverified: {label: 'Unverified', className: 'bg-yellow-100 text-yellow-800'},
    false: {label: 'False', className: 'bg-red-100 text-red-800'},
    insufficient_data: {label: 'Insufficient Data', className: 'bg-grey-100 text-gray-800'},
};

export default function VerdictResult({result}) {
    const style = Verdict_Styles[result.verdict] || Verdict_Styles.insufficient_data;

    return(
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Badge className={style.className} >{style.label} </Badge>
                    {result.confidence != null && (
                        <span className='text-sm text-gray-500'>
                            {Math.round(result.confidence * 100)}% Confidence
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p>{result.reasoning} </p>
                {result.cited_sources? result.cited_sources.length > 0&& (
                    <div>
                        <p className='text-sm font-medium mb-1'>Sources:</p>
                        <ul className='text-sm space-y-1'>
                            {result.cited_sources.map((s, i) => (
                                <li key={i}>
                                    <a href={s.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>
                                        {s.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : <div><p className='text-sm font-medium mb-1'>{result.message} </p></div>}
            </CardContent>
        </Card>
    )
}