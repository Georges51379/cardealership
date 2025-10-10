import DOMPurify from 'dompurify';

interface HTMLContentProps {
  content: string;
  className?: string;
}

// HTML entity decoder to handle content stored as &lt;p&gt;...&lt;/p&gt;
const decodeHtml = (input: string) => {
  if (typeof window === 'undefined') return input;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
};

export const HTMLContent = ({ content, className = '' }: HTMLContentProps) => {
  const decoded = decodeHtml(content);
  const sanitizedHTML = DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                    'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  });

  return (
    <div 
      className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};
