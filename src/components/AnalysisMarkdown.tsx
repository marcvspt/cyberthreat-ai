import { defaultRehypePlugins, Streamdown } from 'streamdown';

const allowedElements = ['p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'blockquote', 'br'];
const rehypePlugins = [defaultRehypePlugins.sanitize, defaultRehypePlugins.harden];

export default function AnalysisMarkdown({ data, streaming }: { data: string; streaming: boolean }) {
    return (
        <Streamdown
            allowedElements={allowedElements}
            rehypePlugins={rehypePlugins}
            skipHtml
            unwrapDisallowed
            controls={false}
            isAnimating={streaming}
        >
            {data}
        </Streamdown>
    );
}
