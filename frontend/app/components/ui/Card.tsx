interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export default function Card({ children, title, className = "" }: CardProps) {
    return (
        <div className={`bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 ${className}`}>
            {title && (
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}